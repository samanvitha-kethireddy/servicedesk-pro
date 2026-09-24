'use strict';

const express = require('express');
const aiController = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/classify', aiController.classifyPreview);
router.post('/recommend-kb', aiController.recommendKBPreview);
router.get('/status', aiController.getAIStatus);

module.exports = router;