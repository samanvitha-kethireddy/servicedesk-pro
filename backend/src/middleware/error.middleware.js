'use strict';

const ApiError = require('../utils/ApiError');

const normalizeError = (err) => {
  if (err instanceof ApiError) {
    return err;
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return new ApiError(400, 'Validation failed', errors);
  }

  // mongoose invalid ObjectId / type cast errors
  if (err.name === 'CastError') {
    return new ApiError(400, `Invalid value for field "${err.path}": ${err.value}`);
  }

  // mongoDB duplicate key errors 
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    return new ApiError(409, `Duplicate value for "${field}": "${value}" already exists`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return new ApiError(401, 'Invalid authentication token');
  }
  if (err.name === 'TokenExpiredError') {
    return new ApiError(401, 'Authentication token has expired, please log in again');
  }

  // malforned JSON body (express.json() SyntaxError)
  if (err.type === 'entity.parse.failed') {
    return new ApiError(400, 'Malformed JSON in request body');
  }

  if (err.message && err.message.includes('immutable')) {
    return new ApiError(403, err.message);
  }

  // unknown/unexpected error
  return new ApiError(
    err.statusCode || 500,
    err.message || 'Internal Server Error',
    [],
    false,
    err.stack
  );
};

const errorHandler = (err, req, res, next) => {
  const normalizedError = normalizeError(err);
  const isProduction = process.env.NODE_ENV === 'production';

  if (!normalizedError.isOperational) {
    console.error('[ERROR] Non-operational error encountered:');
    console.error(err);
  } else if (!isProduction) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} ->`, normalizedError.message);
  }

  const responseBody = {
    success: false,
    statusCode: normalizedError.statusCode,
    message: normalizedError.message,
    errors: normalizedError.errors && normalizedError.errors.length > 0 ? normalizedError.errors : undefined,
    
    stack: !isProduction ? normalizedError.stack : undefined,
  };

  res.status(normalizedError.statusCode || 500).json(responseBody);
};

const notFoundHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

module.exports = {
  errorHandler,
  notFoundHandler,
};