'use strict';

const ApiError = require('../utils/ApiError');
const { ELEVATED_TICKET_ROLES } = require('../config/constants');

const authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Role "${req.user.role}" is not permitted to perform this action. Requires one of: ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
};

const scopeToDepartment = (req, _res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Not authenticated'));
  }

  const isElevated = ELEVATED_TICKET_ROLES.includes(req.user.role);
  req.departmentScope = isElevated ? null : req.user.department;
  req.isElevatedRole = isElevated;

  next();
};

const requireOwnershipOrElevated = (ownershipCheckFn, message = 'You do not have access to this resource') => {
  return async (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Not authenticated'));
    }

    if (ELEVATED_TICKET_ROLES.includes(req.user.role)) {
      return next();
    }

    try {
      const isOwner = await ownershipCheckFn(req);
      if (!isOwner) {
        return next(ApiError.forbidden(message));
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  authorize,
  scopeToDepartment,
  requireOwnershipOrElevated,
};