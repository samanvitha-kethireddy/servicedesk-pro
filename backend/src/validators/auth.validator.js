'use strict';

const validator = require('validator');
const { ROLES_LIST, PATTERNS } = require('../config/constants');

const validateRegister = (body) => {
  const errors = [];
  const value = {};

  if (!body.firstName || body.firstName.trim().length < 2) {
    errors.push({ field: 'firstName', message: 'First name must be at least 2 characters' });
  } else {
    value.firstName = body.firstName.trim();
  }

  if (!body.lastName || body.lastName.trim().length < 1) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  } else {
    value.lastName = body.lastName.trim();
  }

  if (!body.email || !PATTERNS.EMPLOYEE_EMAIL.test(body.email)) {
    errors.push({ field: 'email', message: 'A valid email is required' });
  } else {
    value.email = body.email.toLowerCase().trim();
  }

  if (!body.password || body.password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  } else {
    value.password = body.password;
  }

  if (body.role && !ROLES_LIST.includes(body.role)) {
    errors.push({ field: 'role', message: `Role must be one of: ${ROLES_LIST.join(', ')}` });
  } else {
    value.role = body.role;
  }

  if (!body.department || !validator.isMongoId(String(body.department))) {
    errors.push({ field: 'department', message: 'A valid department is required' });
  } else {
    value.department = body.department;
  }

  value.phone = body.phone ? String(body.phone).trim() : null;
  value.designation = body.designation ? String(body.designation).trim() : null;
  value.employeeCode = body.employeeCode ? String(body.employeeCode).trim() : undefined;

  return { error: errors.length ? errors : null, value };
};

const validateLogin = (body) => {
  const errors = [];
  const value = {};

  if (!body.email || !PATTERNS.EMPLOYEE_EMAIL.test(body.email)) {
    errors.push({ field: 'email', message: 'A valid email is required' });
  } else {
    value.email = body.email.toLowerCase().trim();
  }

  if (!body.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else {
    value.password = body.password;
  }

  return { error: errors.length ? errors : null, value };
};

const validateForgotPassword = (body) => {
  const errors = [];
  const value = {};

  if (!body.email || !PATTERNS.EMPLOYEE_EMAIL.test(body.email)) {
    errors.push({ field: 'email', message: 'A valid email is required' });
  } else {
    value.email = body.email.toLowerCase().trim();
  }

  return { error: errors.length ? errors : null, value };
};

const validateResetPassword = (body) => {
  const errors = [];
  const value = {};

  if (!body.token || typeof body.token !== 'string') {
    errors.push({ field: 'token', message: 'Reset token is required' });
  } else {
    value.token = body.token;
  }

  if (!body.newPassword || body.newPassword.length < 8) {
    errors.push({ field: 'newPassword', message: 'Password must be at least 8 characters' });
  } else {
    value.newPassword = body.newPassword;
  }

  return { error: errors.length ? errors : null, value };
};

const validateChangePassword = (body) => {
  const errors = [];
  const value = {};

  if (!body.currentPassword) {
    errors.push({ field: 'currentPassword', message: 'Current password is required' });
  } else {
    value.currentPassword = body.currentPassword;
  }

  if (!body.newPassword || body.newPassword.length < 8) {
    errors.push({ field: 'newPassword', message: 'New password must be at least 8 characters' });
  } else {
    value.newPassword = body.newPassword;
  }

  return { error: errors.length ? errors : null, value };
};

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
};