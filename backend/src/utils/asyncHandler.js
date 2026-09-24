'use strict';

const asyncHandler = (requestHandler) => {
  return function asyncUtilWrap(req, res, next) {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

module.exports = asyncHandler;