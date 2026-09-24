'use strict';

const ApiError = require('../utils/ApiError');

const validate = (validatorFn, source = 'body') => {
  return (req, _res, next) => {
    const { error, value } = validatorFn(req[source]);

    if (error && error.length > 0) {
      return next(ApiError.badRequest('Validation failed', error));
    }

    req[source] = value;
    next();
  };
};

module.exports = validate;