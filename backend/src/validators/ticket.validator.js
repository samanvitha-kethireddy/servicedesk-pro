'use strict';

const validator = require('validator');
const {
  TICKET_PRIORITY_LIST,
  TICKET_CATEGORY_LIST,
  TICKET_STATUS_LIST,
} = require('../config/constants');

const validateCreateTicket = (body) => {
  const errors = [];
  const value = {};

  if (!body.title || body.title.trim().length < 5) {
    errors.push({ field: 'title', message: 'Title must be at least 5 characters' });
  } else {
    value.title = body.title.trim();
  }

  if (!body.description || body.description.trim().length < 10) {
    errors.push({ field: 'description', message: 'Description must be at least 10 characters' });
  } else {
    value.description = body.description.trim();
  }

  if (body.category && !TICKET_CATEGORY_LIST.includes(body.category)) {
    errors.push({ field: 'category', message: `Category must be one of: ${TICKET_CATEGORY_LIST.join(', ')}` });
  } else {
    value.category = body.category || null; 
  }

  if (body.priority && !TICKET_PRIORITY_LIST.includes(body.priority)) {
    errors.push({ field: 'priority', message: `Priority must be one of: ${TICKET_PRIORITY_LIST.join(', ')}` });
  } else {
    value.priority = body.priority || null;
  }

  if (body.relatedAsset && !validator.isMongoId(String(body.relatedAsset))) {
    errors.push({ field: 'relatedAsset', message: 'Invalid asset reference' });
  } else {
    value.relatedAsset = body.relatedAsset || null;
  }

  value.tags = Array.isArray(body.tags) ? body.tags.map((t) => String(t).trim().toLowerCase()) : [];

  return { error: errors.length ? errors : null, value };
};

const validateUpdateTicket = (body) => {
  const errors = [];
  const value = {};

  if (body.title !== undefined) {
    if (body.title.trim().length < 5) {
      errors.push({ field: 'title', message: 'Title must be at least 5 characters' });
    } else {
      value.title = body.title.trim();
    }
  }

  if (body.description !== undefined) {
    if (body.description.trim().length < 10) {
      errors.push({ field: 'description', message: 'Description must be at least 10 characters' });
    } else {
      value.description = body.description.trim();
    }
  }

  if (body.category !== undefined) {
    if (!TICKET_CATEGORY_LIST.includes(body.category)) {
      errors.push({ field: 'category', message: `Category must be one of: ${TICKET_CATEGORY_LIST.join(', ')}` });
    } else {
      value.category = body.category;
    }
  }

  if (body.priority !== undefined) {
    if (!TICKET_PRIORITY_LIST.includes(body.priority)) {
      errors.push({ field: 'priority', message: `Priority must be one of: ${TICKET_PRIORITY_LIST.join(', ')}` });
    } else {
      value.priority = body.priority;
    }
  }

  if (body.assignedTo !== undefined) {
    if (body.assignedTo !== null && !validator.isMongoId(String(body.assignedTo))) {
      errors.push({ field: 'assignedTo', message: 'Invalid assignee reference' });
    } else {
      value.assignedTo = body.assignedTo;
    }
  }

  if (body.tags !== undefined) {
    value.tags = Array.isArray(body.tags) ? body.tags.map((t) => String(t).trim().toLowerCase()) : [];
  }

  return { error: errors.length ? errors : null, value };
};

const validateStatusChange = (body) => {
  const errors = [];
  const value = {};

  if (!body.status || !TICKET_STATUS_LIST.includes(body.status)) {
    errors.push({ field: 'status', message: `Status must be one of: ${TICKET_STATUS_LIST.join(', ')}` });
  } else {
    value.status = body.status;
  }

  value.note = body.note ? String(body.note).trim() : '';

  return { error: errors.length ? errors : null, value };
};

const validateAddComment = (body) => {
  const errors = [];
  const value = {};

  if (!body.message || body.message.trim().length < 1) {
    errors.push({ field: 'message', message: 'Comment message cannot be empty' });
  } else {
    value.message = body.message.trim();
  }

  value.isInternal = Boolean(body.isInternal);

  return { error: errors.length ? errors : null, value };
};

module.exports = {
  validateCreateTicket,
  validateUpdateTicket,
  validateStatusChange,
  validateAddComment,
};