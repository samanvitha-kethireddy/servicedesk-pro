'use strict';

const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const auditService = require('../services/audit.service');
const {
  AUDIT_ACTION_LIST,
  AUDIT_ENTITY_LIST,
  DEFAULT_PAGE,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} = require('../config/constants');

// GET /audit-logs
const getAllAuditLogs = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_PAGE_LIMIT, parseInt(req.query.limit, 10) || DEFAULT_PAGE_LIMIT);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.action && AUDIT_ACTION_LIST.includes(req.query.action)) filter.action = req.query.action;
  if (req.query.entityType && AUDIT_ENTITY_LIST.includes(req.query.entityType)) filter.entityType = req.query.entityType;
  if (req.query.entityId) filter.entityId = req.query.entityId;
  if (req.query.performedBy) filter.performedBy = req.query.performedBy;
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
  }

  const [logs, totalCount] = await Promise.all([
    AuditLog.find(filter)
      .populate('performedBy', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(filter),
  ]);

  res.status(200).json(ApiResponse.paginated(200, 'Audit logs fetched', logs, totalCount, page, limit));
});

// GET /audit-logs/entity/:entityType/:entityId
const getEntityAuditTrail = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;
  const page = Math.max(1, parseInt(req.query.page, 10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_PAGE_LIMIT, parseInt(req.query.limit, 10) || DEFAULT_PAGE_LIMIT);

  const { logs, totalCount } = await auditService.getEntityAuditTrail(entityType, entityId, { page, limit });

  res.status(200).json(ApiResponse.paginated(200, 'Entity audit trail fetched', logs, totalCount, page, limit));
});

module.exports = {
  getAllAuditLogs,
  getEntityAuditTrail,
};