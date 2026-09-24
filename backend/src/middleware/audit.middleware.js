'use strict';

const auditService = require('../services/audit.service');

const attachAuditLogger = (req, _res, next) => {
  req.audit = async ({ action, entityType, entityId, description, changes = null, metadata = null }) => {
    await auditService.logAction({
      action,
      entityType,
      entityId,
      performedBy: req.user ? req.user._id : null,
      performedByRole: req.user ? req.user.role : null,
      description,
      changes,
      metadata,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || null,
    });
  };

  next();
};

module.exports = { attachAuditLogger };