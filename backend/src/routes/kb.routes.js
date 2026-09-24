'use strict';

const express = require('express');
const kbController = require('../controllers/kb.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { KB_MANAGEMENT_ROLES } = require('../config/constants');

const router = express.Router();

router.use(protect);

router.get('/', kbController.getAllArticles);
router.get('/:idOrSlug', kbController.getArticle);
router.post('/:id/feedback', kbController.submitFeedback);

router.post('/', authorize(...KB_MANAGEMENT_ROLES), kbController.createArticle);
router.patch('/:id', authorize(...KB_MANAGEMENT_ROLES), kbController.updateArticle);
router.delete('/:id', authorize(...KB_MANAGEMENT_ROLES), kbController.deleteArticle);

module.exports = router;