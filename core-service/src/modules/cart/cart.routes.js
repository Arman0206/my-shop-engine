
const express = require('express');
const router = express.Router();
const cartController = require('./cart.controller');
const { requireAuth, requireRole } = require('../../middlewares/auth');

// Every cart route needs a logged-in user.
router.use(requireAuth);

router.post('/', cartController.addToCart);
router.get('/', cartController.getCart);
router.get('/popularity', requireRole('admin'), cartController.getPopularity); // cross-user data
router.delete('/:id', cartController.removeFromCart);

module.exports = router;
