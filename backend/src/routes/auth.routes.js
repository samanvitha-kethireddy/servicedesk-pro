'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
} = require('../validators/auth.validator');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, statusCode: 429, message: 'Too many auth attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, validate(validateRegister), authController.register);
router.post('/login', authLimiter, validate(validateLogin), authController.login);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.post('/forgot-password', authLimiter, validate(validateForgotPassword), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(validateResetPassword), authController.resetPassword);
router.post('/change-password', protect, validate(validateChangePassword), authController.changePassword);

module.exports = router;