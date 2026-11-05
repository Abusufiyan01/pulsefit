/**
 * Auth Routes
 */
const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Rate limiter for auth endpoints: 15 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  authController.login
);

router.post('/logout', auth, authController.logout);

router.post('/refresh', authController.refresh);

router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().withMessage('Please enter a valid email address')],
  validate,
  authController.forgotPassword
);

router.post(
  '/reset-password/:token',
  authLimiter,
  [body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')],
  validate,
  authController.resetPassword
);

router.get('/me', auth, authController.getMe);

module.exports = router;
