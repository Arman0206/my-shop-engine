const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('./auth.controller');
const { requireAuth } = require('../../middlewares/auth');

const router = express.Router();

// Slow down password guessing / account spam: 20 attempts per 15 min per IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later' }
});

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.get('/me', requireAuth, authController.me);

module.exports = router;
