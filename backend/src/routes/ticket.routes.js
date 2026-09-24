'use strict';

const express = require('express');
const ticketController = require('../controllers/ticket.controller');
const { protect } = require('../middleware/auth.middleware');
const { scopeToDepartment } = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const {
  validateCreateTicket,
  validateUpdateTicket,
  validateStatusChange,
} = require('../validators/ticket.validator');

const router = express.Router();

router.use(protect, scopeToDepartment);

router.post('/', validate(validateCreateTicket), ticketController.createTicket);
router.get('/', ticketController.getAllTickets);
router.get('/:id', ticketController.getTicketById);
router.patch('/:id', validate(validateUpdateTicket), ticketController.updateTicket);
router.patch('/:id/status', validate(validateStatusChange), ticketController.changeTicketStatus);
router.patch('/:id/assign', ticketController.assignTicket);
router.post('/:id/watch', ticketController.toggleWatchTicket);
router.post('/:id/ai-feedback', ticketController.submitAIFeedback);
router.delete('/:id', ticketController.deleteTicket);

module.exports = router;