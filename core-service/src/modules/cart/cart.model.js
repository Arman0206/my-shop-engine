const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1, min: 1, validate: Number.isInteger },
  createdAt: { type: Date, default: Date.now }
});

// One row per (user, product). Enforced by MongoDB itself, so it holds even
// under concurrent requests -- application-level "check then insert" cannot.
// Also serves as the index for "get this user's cart" (userId is the prefix).
cartSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('Cart', cartSchema);
