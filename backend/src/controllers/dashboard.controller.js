'use strict';

const Ticket = require('../models/Ticket');
const Asset = require('../models/Asset');
const User = require('../models/User');
const KnowledgeBaseArticle = require('../models/KnowledgeBaseArticle');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const {
  TICKET_STATUS,
  TICKET_PRIORITY_LIST,
  SLA_STATUS,
  ASSET_STATUS_LIST,
  ROLES,
  ELEVATED_TICKET_ROLES,
} = require('../config/constants');

// GET /dashboard/summary
const getDashboardSummary = asyncHandler(async (req, res) => {
  const isElevated = ELEVATED_TICKET_ROLES.includes(req.user.role);
  const ticketFilter = { isDeleted: false };

  if (!isElevated) {
    if (req.user.role === ROLES.EMPLOYEE) {
      ticketFilter.raisedBy = req.user._id;
    } else if (req.user.role === ROLES.TECHNICIAN) {
      ticketFilter.assignedTo = req.user._id;
    } else {
      ticketFilter.department = req.user.department;
    }
  }

  const [
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
    breachedSLA,
    atRiskSLA,
    priorityBreakdown,
    statusBreakdown,
  ] = await Promise.all([
    Ticket.countDocuments(ticketFilter),
    Ticket.countDocuments({ ...ticketFilter, status: TICKET_STATUS.OPEN }),
    Ticket.countDocuments({ ...ticketFilter, status: TICKET_STATUS.IN_PROGRESS }),
    Ticket.countDocuments({ ...ticketFilter, status: TICKET_STATUS.RESOLVED }),
    Ticket.countDocuments({ ...ticketFilter, slaResolutionStatus: SLA_STATUS.BREACHED }),
    Ticket.countDocuments({ ...ticketFilter, slaResolutionStatus: SLA_STATUS.AT_RISK }),
    Ticket.aggregate([
      { $match: ticketFilter },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    Ticket.aggregate([
      { $match: ticketFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const summary = {
    tickets: {
      total: totalTickets,
      open: openTickets,
      inProgress: inProgressTickets,
      resolved: resolvedTickets,
      slaBreached: breachedSLA,
      slaAtRisk: atRiskSLA,
      byPriority: TICKET_PRIORITY_LIST.reduce((acc, p) => {
        acc[p] = priorityBreakdown.find((x) => x._id === p)?.count || 0;
        return acc;
      }, {}),
      byStatus: statusBreakdown.reduce((acc, s) => {
        acc[s._id] = s.count;
        return acc;
      }, {}),
    },
  };

  if (isElevated || req.user.role === ROLES.ASSET_MANAGER) {
    const [assetTotal, assetBreakdown, activeUsers] = await Promise.all([
      Asset.countDocuments({ isDeleted: false }),
      Asset.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      User.countDocuments({ isActive: true }),
    ]);

    summary.assets = {
      total: assetTotal,
      byStatus: ASSET_STATUS_LIST.reduce((acc, s) => {
        acc[s] = assetBreakdown.find((x) => x._id === s)?.count || 0;
        return acc;
      }, {}),
    };
    summary.users = { activeCount: activeUsers };
  }

  if (isElevated) {
    const kbTotal = await KnowledgeBaseArticle.countDocuments({ isDeleted: false });
    summary.knowledgeBase = { total: kbTotal };
  }

  res.status(200).json(new ApiResponse(200, 'Dashboard summary fetched', summary));
});

// GET /dashboard/recent-tickets
const getRecentTickets = asyncHandler(async (req, res) => {
  const isElevated = ELEVATED_TICKET_ROLES.includes(req.user.role);
  const filter = { isDeleted: false };

  if (!isElevated) {
    if (req.user.role === ROLES.EMPLOYEE) {
      filter.raisedBy = req.user._id;
    } else if (req.user.role === ROLES.TECHNICIAN) {
      filter.assignedTo = req.user._id;
    } else {
      filter.department = req.user.department;
    }
  }

  const limit = Math.min(20, parseInt(req.query.limit, 10) || 5);

  const tickets = await Ticket.find(filter)
    .populate('raisedBy', 'firstName lastName')
    .populate('assignedTo', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(limit);

  res.status(200).json(new ApiResponse(200, 'Recent tickets fetched', { tickets }));
});

// GET /dashboard/sla-trend
const getSLATrend = asyncHandler(async (req, res) => {
  const days = Math.min(90, parseInt(req.query.days, 10) || 14);
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const isElevated = ELEVATED_TICKET_ROLES.includes(req.user.role);
  const matchFilter = { isDeleted: false, createdAt: { $gte: startDate } };
  if (!isElevated) matchFilter.department = req.user.department;

  const trend = await Ticket.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        created: { $sum: 1 },
        breached: {
          $sum: { $cond: [{ $eq: ['$slaResolutionStatus', SLA_STATUS.BREACHED] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json(new ApiResponse(200, 'SLA trend fetched', { trend }));
});

module.exports = {
  getDashboardSummary,
  getRecentTickets,
  getSLATrend,
};