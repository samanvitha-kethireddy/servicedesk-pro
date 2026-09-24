'use strict';

const jwt = require('jsonwebtoken');
const { COOKIE_NAME } = require('../config/constants');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_COOKIE_EXPIRES_IN_DAYS = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 7;

if (!JWT_SECRET) {
  console.error('[Auth] FATAL: JWT_SECRET is not defined in environment variables.');
}


const signToken = (user) => {
  const payload = {
    id: user._id.toString(),
    role: user.role,
    department: user.department ? user.department.toString() : null,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'servicedesk-pro-api',
  });
};


const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};


const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction, 
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(Date.now() + JWT_COOKIE_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000),
    path: '/',
  };
};


const attachTokenCookie = (user, res) => {
  const token = signToken(user);
  res.cookie(COOKIE_NAME, token, getCookieOptions());
  return token;
};


const clearTokenCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
};

module.exports = {
  signToken,
  verifyToken,
  attachTokenCookie,
  clearTokenCookie,
  getCookieOptions,
};