'use strict';

const Ticket = require('../models/Ticket');
const KnowledgeBaseArticle = require('../models/KnowledgeBaseArticle');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { generateTicketCode } = require('../utils/ticketCodeGenerator');
const aiService = require('../services/ai.service');
const slaService = require('../services/sla.service');
const notificationService = require('../services/notification.service');
const auditService = require('../services/audit.service');
const {
  AUDIT_ACTION,
  AUDIT_ENTITY,
  TICKET_STATUS,
  NOTIFICATION_TYPE,
  ASSIGNABLE_ROLES,
  ELEVATED_TICKET_ROLES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} = require('../config/constants');

// POST /tickets
const createTicket = asyncHandler(async (req, res) => {
  const { title, description, category, priority, relatedAsset, tags, source } = req.body;

  let finalCategory = category;
  let finalPriority = priority;
  let aiClassification = { wasAccepted: null };

  // auto-classify with AI if category/priority not provided
  if (!finalCategory || !finalPriority) {
    const classification = await aiService.classifyTicket(title, description);
    if (classification) {
      finalCategory = finalCategory || classification.suggestedCategory;
      finalPriority = finalPriority || classification.suggestedPriority;
      aiClassification = { ...classification, wasAccepted: null };
    } else {
      finalCategory = finalCategory || 'Other';
      finalPriority = finalPriority || 'Medium';
    }
  }

  const ticketCode = await generateTicketCode();
  const now = new Date();
  const slaTargets = await slaService.computeSLATargets(finalPriority, finalCategory, now);

  // Get KB recommendations
  const kbRecommendations = await aiService.recommendKBArticles(title, description, finalCategory);
  aiClassification.suggestedKbArticleIds = kbRecommendations.map((r) => r.id);

  const ticket = await Ticket.create({
    ticketCode,
    title,
    description,
    category: finalCategory,
    priority: finalPriority,
    source: source || 'Web Portal',
    raisedBy: req.user._id,
    department: req.user.department,
    relatedAsset: relatedAsset || null,
    tags: tags || [],
    slaResponseTargetAt: slaTargets.slaResponseTargetAt,
    slaResolutionTargetAt: slaTargets.slaResolutionTargetAt,
    aiClassification,
    statusHistory: [{ toStatus: TICKET_STATUS.OPEN, changedBy: req.user._id, note: 'Ticket created' }],
  });

  await auditService.logAction({
    action: AUDIT_ACTION.CREATE,
    entityType: AUDIT_ENTITY.TICKET,
    entityId: ticket._id,
    performedBy: req.user._id,
    performedByRole: req.user.role,
    description: `${req.user.email} created ticket ${ticketCode}`,
  });

  const populatedTicket = await Ticket.findById(ticket._id)
    .populate('raisedBy', 'firstName lastName email')
    .populate('department', 'name code');

  res.status(201).json(new ApiResponse(201, 'Ticket created', {
    ticket: populatedTicket,
    kbRecommendations,
  }));
});

// GET /tickets
// const getAllTickets = asyncHandler(async (req, res) => {
//   const page = Math.max(1, parseInt(req.query.page, 10) || DEFAULT_PAGE);
//   const limit = Math.min(MAX_PAGE_LIMIT, parseInt(req.query.limit, 10) || DEFAULT_PAGE_LIMIT);
//   const skip = (page - 1) * limit;

//   const filter = { isDeleted: false };

//   if (!req.isElevatedRole) {
//     if (req.user.role === 'Employee') {
//       filter.raisedBy = req.user._id;
//     } else {
//       filter.department = req.user.department;
//     }
//   }

//   if (req.query.status) filter.status = req.query.status;
//   if (req.query.priority) filter.priority = req.query.priority;
//   if (req.query.category) filter.category = req.query.category;
//   if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
//   if (req.query.department && req.isElevatedRole) filter.department = req.query.department;
//   if (req.query.slaResolutionStatus) filter.slaResolutionStatus = req.query.slaResolutionStatus;
//   if (req.query.search) {
//     filter.$or = [
//       { title: { $regex: req.query.search, $options: 'i' } },
//       { ticketCode: { $regex: req.query.search, $options: 'i' } },
//     ];
//   }

//   const sortField = req.query.sortBy || 'createdAt';
//   const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

//   const [tickets, totalCount] = await Promise.all([
//     Ticket.find(filter)
//       .populate('raisedBy', 'firstName lastName email')
//       .populate('assignedTo', 'firstName lastName email')
//       .populate('department', 'name code')
//       .sort({ [sortField]: sortOrder })
//       .skip(skip)
//       .limit(limit),
//     Ticket.countDocuments(filter),
//   ]);

//   res.status(200).json(ApiResponse.paginated(200, 'Tickets fetched', tickets, totalCount, page, limit));
// });
const getAllTickets = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_PAGE_LIMIT, parseInt(req.query.limit, 10) || DEFAULT_PAGE_LIMIT);
  const skip = (page - 1) * limit;

  const filter = { isDeleted: false };
  const andConditions = [];

  if (!req.isElevatedRole) {
    if (req.user.role === 'Employee') {
      filter.raisedBy = req.user._id;
    } else {
      // Technician / Asset Manager: see tickets in their department
      // OR tickets specifically assigned to them (even cross-department)
      andConditions.push({
        $or: [
          { department: req.user.department },
          { assignedTo: req.user._id },
        ],
      });
    }
  }

  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
  if (req.query.department && req.isElevatedRole) filter.department = req.query.department;
  if (req.query.slaResolutionStatus) filter.slaResolutionStatus = req.query.slaResolutionStatus;
  if (req.query.search) {
    andConditions.push({
      $or: [
        { title: { $regex: req.query.search, $options: 'i' } },
        { ticketCode: { $regex: req.query.search, $options: 'i' } },
      ],
    });
  }

  if (andConditions.length > 0) filter.$and = andConditions;

  const sortField = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  const [tickets, totalCount] = await Promise.all([
    Ticket.find(filter)
      .populate('raisedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('department', 'name code')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    Ticket.countDocuments(filter),
  ]);

  res.status(200).json(ApiResponse.paginated(200, 'Tickets fetched', tickets, totalCount, page, limit));
});


// GET /tickets/:id
const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({ _id: req.params.id, isDeleted: false })
    .populate('raisedBy', 'firstName lastName email phone')
    .populate('assignedTo', 'firstName lastName email')
    .populate('department', 'name code')
    .populate('relatedAsset', 'assetCode name category')
    .populate('watchers', 'firstName lastName email')
    .populate('aiClassification.suggestedKbArticleIds', 'title slug summary');

  if (!ticket) throw ApiError.notFound('Ticket not found');

  const isOwner = String(ticket.raisedBy._id) === String(req.user._id);
  const isAssignee = ticket.assignedTo && String(ticket.assignedTo._id) === String(req.user._id);
  const sameDept = String(ticket.department._id) === String(req.user.department);

  if (!req.isElevatedRole && !isOwner && !isAssignee && !sameDept) {
    throw ApiError.forbidden('You do not have access to this ticket');
  }

  res.status(200).json(new ApiResponse(200, 'Ticket fetched', { ticket }));
});

// PATCH /tickets/:id
const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({ _id: req.params.id, isDeleted: false });
  if (!ticket) throw ApiError.notFound('Ticket not found');

  const allowedFields = ['title', 'description', 'category', 'priority', 'tags'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const changes = auditService.buildChangeDiff(ticket.toObject(), updates);

  // change SLA targets if priority/category changes
  if (updates.priority || updates.category) {
    const newPriority = updates.priority || ticket.priority;
    const newCategory = updates.category || ticket.category;
    const slaTargets = await slaService.computeSLATargets(newPriority, newCategory, ticket.createdAt);
    ticket.slaResponseTargetAt = slaTargets.slaResponseTargetAt;
    ticket.slaResolutionTargetAt = slaTargets.slaResolutionTargetAt;
  }

  Object.assign(ticket, updates);
  slaService.refreshTicketSLAStatus(ticket);
  await ticket.save();

  await auditService.logAction({
    action: AUDIT_ACTION.UPDATE,
    entityType: AUDIT_ENTITY.TICKET,
    entityId: ticket._id,
    performedBy: req.user._id,
    performedByRole: req.user.role,
    description: `${req.user.email} updated ticket ${ticket.ticketCode}`,
    changes,
  });

  res.status(200).json(new ApiResponse(200, 'Ticket updated', { ticket }));
});

// PATCH /tickets/:id/status
const changeTicketStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  const ticket = await Ticket.findOne({ _id: req.params.id, isDeleted: false });
  if (!ticket) throw ApiError.notFound('Ticket not found');

  if (!ticket.canTransitionTo(status)) {
    throw ApiError.badRequest(`Cannot transition ticket from "${ticket.status}" to "${status}"`);
  }

  const previousStatus = ticket.status;
  slaService.handleSLAPauseResume(ticket, status);
  ticket.recordStatusChange(status, req.user._id, note);

  if (status === TICKET_STATUS.RESOLVED) ticket.resolvedAt = new Date();
  if (status === TICKET_STATUS.CLOSED) ticket.closedAt = new Date();
  if (status === TICKET_STATUS.REOPENED) ticket.reopenedAt = new Date();
  if (!ticket.firstResponseAt && status === TICKET_STATUS.IN_PROGRESS) {
    ticket.firstResponseAt = new Date();
  }

  slaService.refreshTicketSLAStatus(ticket);
  await ticket.save();

  await auditService.logAction({
    action: AUDIT_ACTION.STATUS_CHANGE,
    entityType: AUDIT_ENTITY.TICKET,
    entityId: ticket._id,
    performedBy: req.user._id,
    performedByRole: req.user.role,
    description: `${req.user.email} changed ticket ${ticket.ticketCode} status from "${previousStatus}" to "${status}"`,
  });

  await notificationService.notifyUser({
    recipient: ticket.raisedBy,
    type: NOTIFICATION_TYPE.TICKET_UPDATED,
    title: `Ticket ${ticket.ticketCode} updated`,
    message: `Your ticket status changed to "${status}"`,
    relatedEntityType: 'Ticket',
    relatedEntityId: ticket._id,
    link: notificationService.buildTicketLink(ticket._id),
  });

  res.status(200).json(new ApiResponse(200, 'Ticket status updated', { ticket }));
});

// PATCH /tickets/:id/assign
const assignTicket = asyncHandler(async (req, res) => {
  const { assignedTo } = req.body;

  const ticket = await Ticket.findOne({ _id: req.params.id, isDeleted: false });
  if (!ticket) throw ApiError.notFound('Ticket not found');

  const User = require('../models/User');
  const assignee = await User.findById(assignedTo);
  if (!assignee || !ASSIGNABLE_ROLES.includes(assignee.role)) {
    throw ApiError.badRequest('Assignee must be a Technician or IT Manager');
  }

  ticket.assignedTo = assignedTo;
  await ticket.save();

  await auditService.logAction({
    action: AUDIT_ACTION.ASSIGN,
    entityType: AUDIT_ENTITY.TICKET,
    entityId: ticket._id,
    performedBy: req.user._id,
    performedByRole: req.user.role,
    description: `${req.user.email} assigned ticket ${ticket.ticketCode} to ${assignee.email}`,
  });

  await notificationService.notifyUser({
    recipient: assignee._id,
    type: NOTIFICATION_TYPE.TICKET_ASSIGNED,
    title: `Ticket ${ticket.ticketCode} assigned to you`,
    message: `You've been assigned: ${ticket.title}`,
    relatedEntityType: 'Ticket',
    relatedEntityId: ticket._id,
    link: notificationService.buildTicketLink(ticket._id),
  });

  const populatedTicket = await Ticket.findById(ticket._id).populate('assignedTo', 'firstName lastName email');
  res.status(200).json(new ApiResponse(200, 'Ticket assigned', { ticket: populatedTicket }));
});

// POST /tickets/:id/watch
const toggleWatchTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({ _id: req.params.id, isDeleted: false });
  if (!ticket) throw ApiError.notFound('Ticket not found');

  const userId = String(req.user._id);
  const isWatching = ticket.watchers.some((w) => String(w) === userId);

  if (isWatching) {
    ticket.watchers = ticket.watchers.filter((w) => String(w) !== userId);
  } else {
    ticket.watchers.push(req.user._id);
  }

  await ticket.save();
  res.status(200).json(new ApiResponse(200, isWatching ? 'Stopped watching ticket' : 'Now watching ticket', { ticket }));
});

// POST /tickets/:id/ai-feedback
const submitAIFeedback = asyncHandler(async (req, res) => {
  const { wasAccepted } = req.body;

  const ticket = await Ticket.findOne({ _id: req.params.id, isDeleted: false });
  if (!ticket) throw ApiError.notFound('Ticket not found');

  ticket.aiClassification.wasAccepted = Boolean(wasAccepted);
  await ticket.save();

  if (wasAccepted && ticket.aiClassification.suggestedKbArticleIds?.length) {
    await KnowledgeBaseArticle.updateMany(
      { _id: { $in: ticket.aiClassification.suggestedKbArticleIds } },
      { $inc: { linkedTicketsResolvedCount: 1 } }
    );
  }

  res.status(200).json(new ApiResponse(200, 'AI feedback recorded', { ticket }));
});

// DELETE /tickets/:id (soft delete)
const deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({ _id: req.params.id, isDeleted: false });
  if (!ticket) throw ApiError.notFound('Ticket not found');

  ticket.isDeleted = true;
  await ticket.save();

  await auditService.logAction({
    action: AUDIT_ACTION.DELETE,
    entityType: AUDIT_ENTITY.TICKET,
    entityId: ticket._id,
    performedBy: req.user._id,
    performedByRole: req.user.role,
    description: `${req.user.email} deleted ticket ${ticket.ticketCode}`,
  });

  res.status(200).json(new ApiResponse(200, 'Ticket deleted'));
});

module.exports = {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  changeTicketStatus,
  assignTicket,
  toggleWatchTicket,
  submitAIFeedback,
  deleteTicket,
};