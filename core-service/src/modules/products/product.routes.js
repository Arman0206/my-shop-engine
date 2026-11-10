const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const productController = require('./product.controller');
const { requireAuth, requireRole } = require('../../middlewares/auth');

const admin = [requireAuth, requireRole('admin')];

// Public endpoint that writes: cap it so views can't be trivially inflated.
const viewLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests' }
});

// Public reads (storefront + recommendation-service)
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.get('/:id/candidates', productController.getCandidates);
router.post('/:id/view', viewLimiter, productController.trackView);

// Catalog management: admins only
router.post('/', ...admin, productController.createProduct);
router.put('/:id', ...admin, productController.updateProduct);
router.delete('/:id', ...admin, productController.deleteProduct);

module.exports = router;
