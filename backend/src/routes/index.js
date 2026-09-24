'use strict';

const express = require('express');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const ticketRoutes = require('./ticket.routes');
const commentRoutes = require('./comment.routes');
const assetRoutes = require('./asset.routes');
const kbRoutes = require('./kb.routes');
const dashboardRoutes = require('./dashboard.routes');
const auditRoutes = require('./audit.routes');
const departmentRoutes = require('./department.routes');
const notificationRoutes = require('./notification.routes');
const aiRoutes = require('./ai.routes');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'ServiceDesk Pro API is running', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tickets', ticketRoutes);
router.use('/assets', assetRoutes);
router.use('/kb', kbRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/departments', departmentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ai', aiRoutes);
router.use('/audit-logs', auditRoutes);

router.use('/', commentRoutes);

module.exports = router;