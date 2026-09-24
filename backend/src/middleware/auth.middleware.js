'use strict';

const { verifyToken } = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const { COOKIE_NAME } = require('../config/constants');

const protect = asyncHandler(async (req, _res, next) => {
  let token = null;

  // try cookie first
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    token = req.cookies[COOKIE_NAME];
  }

  //  fall back to Authorization header
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(ApiError.unauthorized('Not authenticated — no token provided'));
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    return next(err);
  }

  const currentUser = await User.findById(decoded.id).select('+passwordChangedAt +refreshTokenVersion');

  if (!currentUser) {
    return next(ApiError.unauthorized('The user belonging to this token no longer exists'));
  }

  if (!currentUser.isActive) {
    return next(ApiError.forbidden('This account has been deactivated. Contact your System Admin.'));
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(ApiError.unauthorized('Password was recently changed. Please log in again.'));
  }

  // strip sensitive fields before attaching to request
  currentUser.passwordChangedAt = undefined;
  currentUser.refreshTokenVersion = undefined;

  req.user = currentUser;
  req.tokenPayload = decoded;
  next();
});

const optionalAuth = asyncHandler(async (req, _res, next) => {
  let token = null;

  if (req.cookies && req.cookies[COOKIE_NAME]) {
    token = req.cookies[COOKIE_NAME];
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next();

  try {
    const decoded = verifyToken(token);
    const currentUser = await User.findById(decoded.id);
    if (currentUser && currentUser.isActive) {
      req.user = currentUser;
      req.tokenPayload = decoded;
    }
  } catch (err) {
    // ignore invalid/expired tokens for optional auth
  }

  next();
});

module.exports = {
  protect,
  optionalAuth,
};