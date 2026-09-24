'use strict';

const User = require('../models/User');
const Department = require('../models/Department');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { attachTokenCookie, clearTokenCookie } = require('../utils/generateToken');
const { AUDIT_ACTION, AUDIT_ENTITY, ROLES } = require('../config/constants');

// POST /auth/register
const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role, department, phone, designation, employeeCode } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const dept = await Department.findById(department);
  if (!dept || !dept.isActive) {
    throw ApiError.badRequest('Invalid or inactive department');
  }

  const assignedRole = req.user ? role || ROLES.EMPLOYEE : ROLES.EMPLOYEE;

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: assignedRole,
    department,
    phone,
    designation,
    employeeCode,
    createdBy: req.user ? req.user._id : null,
  });

  const token = attachTokenCookie(user, res);

  await req.audit?.({
    action: AUDIT_ACTION.CREATE,
    entityType: AUDIT_ENTITY.USER,
    entityId: user._id,
    description: `User account created: ${user.email} (${user.role})`,
  });

  const safeUser = await User.findById(user._id).populate('department', 'name code');

  res.status(201).json(new ApiResponse(201, 'Registration successful', { user: safeUser, token }));
});

// POST /auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findByEmailWithPassword(email);
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = attachTokenCookie(user, res);

  await req.audit?.({
    action: AUDIT_ACTION.LOGIN,
    entityType: AUDIT_ENTITY.USER,
    entityId: user._id,
    description: `${user.email} logged in`,
  });

  const safeUser = await User.findById(user._id).populate('department', 'name code');

  res.status(200).json(new ApiResponse(200, 'Login successful', { user: safeUser, token }));
});

// POST /auth/logout
const logout = asyncHandler(async (req, res) => {
  clearTokenCookie(res);

  if (req.user) {
    await req.audit?.({
      action: AUDIT_ACTION.LOGOUT,
      entityType: AUDIT_ENTITY.USER,
      entityId: req.user._id,
      description: `${req.user.email} logged out`,
    });
  }

  res.status(200).json(new ApiResponse(200, 'Logged out successfully'));
});

// GET /auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('department', 'name code');
  res.status(200).json(new ApiResponse(200, 'Current user fetched', { user }));
});

// POST /auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email, isActive: true });

  if (!user) {
    return res.status(200).json(
      new ApiResponse(200, 'If an account with that email exists, a reset link has been generated')
    );
  }

  const rawToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });


  res.status(200).json(
    new ApiResponse(200, 'Password reset token generated', {
      resetToken: rawToken,
      expiresInMinutes: 10,
    })
  );
});

// POST /auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const crypto = require('crypto');
  const { token, newPassword } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    throw ApiError.badRequest('Password reset token is invalid or has expired');
  }

  user.password = newPassword;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  user.invalidateTokens();
  await user.save();

  const authToken = attachTokenCookie(user, res);

  res.status(200).json(new ApiResponse(200, 'Password reset successful', { token: authToken }));
});

// POST /auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  user.password = newPassword;
  user.invalidateTokens();
  await user.save();

  const token = attachTokenCookie(user, res);

  await req.audit?.({
    action: AUDIT_ACTION.UPDATE,
    entityType: AUDIT_ENTITY.USER,
    entityId: user._id,
    description: `${user.email} changed their password`,
  });

  res.status(200).json(new ApiResponse(200, 'Password changed successfully', { token }));
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
};