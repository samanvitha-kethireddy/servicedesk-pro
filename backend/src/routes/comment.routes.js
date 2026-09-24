'use strict';

const express = require('express');
const commentController = require('../controllers/comment.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { validateAddComment } = require('../validators/ticket.validator');

const router = express.Router();

router.use(protect);


router.post('/tickets/:ticketId/comments', validate(validateAddComment), commentController.addComment);
router.get('/tickets/:ticketId/comments', commentController.getCommentsForTicket);


router.patch('/comments/:id', commentController.updateComment);
router.delete('/comments/:id', commentController.deleteComment);

module.exports = router;