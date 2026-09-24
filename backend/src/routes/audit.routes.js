'use strict';

const express = require('express');
const auditController = require('../controllers/audit.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { AUDIT_VIEW_ROLES } = require('../config/constants');

const router = express.Router();

router.use(protect, authorize(...AUDIT_VIEW_ROLES));

router.get('/', auditController.getAllAuditLogs);
router.get('/entity/:entityType/:entityId', auditController.getEntityAuditTrail);

module.exports = router;