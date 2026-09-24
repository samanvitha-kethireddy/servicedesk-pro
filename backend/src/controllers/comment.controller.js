'use strict';

const TicketComment = require('../models/TicketComment');
const Ticket = require('../models/Ticket');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const notificationService = require('../services/notification.service');
const { NOTIFICATION_TYPE, ROLES } = require('../config/constants');

// POST /tickets/:ticketId/comments
const addComment = asyncHandler(async (req, res) => {
  const { message, isInternal } = req.body;

  const ticket = await Ticket.findOne({ _id: req.params.ticketId, isDeleted: false });
  if (!ticket) throw ApiError.notFound('Ticket not found');

  const finalIsInternal = req.user.role === ROLES.EMPLOYEE ? false : Boolean(isInternal);

  const comment = await TicketComment.create({
    ticket: ticket._id,
    author: req.user._id,
    message,
    isInternal: finalIsInternal,
  });

  const populatedComment = await TicketComment.findById(comment._id).populate('author', 'firstName lastName email role');

 const recipients = new Set();
  if (!finalIsInternal && String(ticket.raisedBy) !== String(req.user._id)) {
    recipients.add(String(ticket.raisedBy));
  }
  if (ticket.assignedTo && String(ticket.assignedTo) !== String(req.user._id)) {
    recipients.add(String(ticket.assignedTo));
  }
  ticket.watchers.forEach((w) => {
    if (String(w) !== String(req.user._id)) recipients.add(String(w));
  });

  await notificationService.notifyMany([...recipients], {
    type: NOTIFICATION_TYPE.TICKET_COMMENT,
    title: `New comment on ${ticket.ticketCode}`,
    message: `${req.user.firstName} commented: ${message.slice(0, 100)}`,
    relatedEntityType: 'Ticket',
    relatedEntityId: ticket._id,
    link: notificationService.buildTicketLink(ticket._id),
  });

  res.status(201).json(new ApiResponse(201, 'Comment added', { comment: populatedComment }));
});

// GET /tickets/:ticketId/comments
const getCommentsForTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({ _id: req.params.ticketId, isDeleted: false });
  if (!ticket) throw ApiError.notFound('Ticket not found');

  const filter = { ticket: ticket._id, isDeleted: false };

  // employees cant see internal notes
  if (req.user.role === ROLES.EMPLOYEE) {
    filter.isInternal = false;
  }

  const comments = await TicketComment.find(filter)
    .populate('author', 'firstName lastName email role')
    .sort({ createdAt: 1 });

  res.status(200).json(new ApiResponse(200, 'Comments fetched', { comments }));
});

// PATCH /comments/:id
const updateComment = asyncHandler(async (req, res) => {
  const { message } = req.body;

  const comment = await TicketComment.findOne({ _id: req.params.id, isDeleted: false });
  if (!comment) throw ApiError.notFound('Comment not found');

  if (String(comment.author) !== String(req.user._id)) {
    throw ApiError.forbidden('You can only edit your own comments');
  }

  comment.message = message;
  comment.editedAt = new Date();
  await comment.save();

  res.status(200).json(new ApiResponse(200, 'Comment updated', { comment }));
});

// DELETE /comments/:id
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await TicketComment.findOne({ _id: req.params.id, isDeleted: false });
  if (!comment) throw ApiError.notFound('Comment not found');

  const isAuthor = String(comment.author) === String(req.user._id);
  if (!isAuthor && !req.isElevatedRole) {
    throw ApiError.forbidden('You do not have permission to delete this comment');
  }

  comment.isDeleted = true;
  await comment.save();

  res.status(200).json(new ApiResponse(200, 'Comment deleted'));
});

module.exports = {
  addComment,
  getCommentsForTicket,
  updateComment,
  deleteComment,
};