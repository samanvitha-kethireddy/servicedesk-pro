'use strict';

class ApiError extends Error {
  
  constructor(statusCode, message = 'Something went wrong', errors = [], isOperational = true, stack = '') {
    super(message);

    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    this.success = false;
    this.data = null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

 
  static badRequest(message = 'Bad Request', errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized - Authentication required') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden - You do not have permission to perform this action') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflict - Resource already exists') {
    return new ApiError(409, message);
  }

  static unprocessable(message = 'Unprocessable Entity', errors = []) {
    return new ApiError(422, message, errors);
  }

  static tooManyRequests(message = 'Too many requests, please try again later') {
    return new ApiError(429, message);
  }

  static internal(message = 'Internal Server Error') {
    return new ApiError(500, message, [], false);
  }

  static serviceUnavailable(message = 'Service temporarily unavailable') {
    return new ApiError(503, message, [], false);
  }
}

module.exports = ApiError;