'use strict';

const AuditLog = require('../models/AuditLog');

const logAction = async ({
  action,
  entityType,
  entityId = null,
  performedBy = null,
  performedByRole = null,
  description,
  changes = null,
  metadata = null,
  ipAddress = null,
  userAgent = null,
}) => {
  try {
    return await AuditLog.create({
      action,
      entityType,
      entityId,
      performedBy,
      performedByRole,
      description,
      changes,
      metadata,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    console.error('[Audit] Failed to write audit log:', err.message);
    return null;
  }
};

const buildChangeDiff = (originalDoc, updatePayload) => {
  const changes = {};
  Object.keys(updatePayload).forEach((key) => {
    const oldValue = originalDoc[key];
    const newValue = updatePayload[key];
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes[key] = { from: oldValue, to: newValue };
    }
  });
  return Object.keys(changes).length > 0 ? changes : null;
};

const getEntityAuditTrail = async (entityType, entityId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [logs, totalCount] = await Promise.all([
    AuditLog.find({ entityType, entityId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('performedBy', 'firstName lastName email role')
      .lean(),
    AuditLog.countDocuments({ entityType, entityId }),
  ]);
  return { logs, totalCount };
};

module.exports = {
  logAction,
  buildChangeDiff,
  getEntityAuditTrail,
};