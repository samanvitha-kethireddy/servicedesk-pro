'use strict';

const ApiError = require('../utils/ApiError');

const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const cleaned = {};
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) continue;
      cleaned[key] = sanitizeValue(value[key]);
    }
    return cleaned;
  }

  if (typeof value === 'string') {
    return value.replace(/<script.*?>.*?<\/script>/gi, '').trim();
  }

  return value;
};

const mongoSanitize = (req, _res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.params) req.params = sanitizeValue(req.params);
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      req.query[key] = sanitizeValue(req.query[key]);
    }
  }
  next();
};

const MAX_BODY_KEYS = 200;
const guardPayloadShape = (req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    if (Object.keys(req.body).length > MAX_BODY_KEYS) {
      return next(ApiError.badRequest('Request payload too large/complex'));
    }
  }
  next();
};

module.exports = {
  mongoSanitize,
  guardPayloadShape,
};