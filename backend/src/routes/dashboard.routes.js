'use strict';

const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/summary', dashboardController.getDashboardSummary);
router.get('/recent-tickets', dashboardController.getRecentTickets);
router.get('/sla-trend', dashboardController.getSLATrend);

module.exports = router;