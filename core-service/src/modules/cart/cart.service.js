
const Cart = require('./cart.model');

// Add-or-increment in ONE atomic operation.
//   - no row for (userId, productId): insert it with `quantity`
//   - row exists: add `quantity` to the existing one
// Returns { item, created } so the controller can answer 201 vs 200.
const addToCart = async ({ userId, productId, quantity = 1 }) => {
  const run = () =>
    Cart.findOneAndUpdate(
      { userId, productId },
      { $inc: { quantity }, $setOnInsert: { createdAt: new Date() } },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
        includeResultMetadata: true
      }
    );

  let result;
  try {
    result = await run();
  } catch (error) {
    // Two simultaneous first-time adds can both try to insert; the unique index
    // rejects one with E11000. The row exists now, so retrying turns it into an update.
    if (error.code !== 11000) throw error;
    result = await run();
  }

  return {
    item: result.value,
    created: !result.lastErrorObject?.updatedExisting
  };
};

const getCartByUser = (userId) => Cart.find({ userId }).populate('productId');

// Scoped by userId: deleting someone else's cart row matches nothing -> 404.
const removeFromCart = (id, userId) => Cart.findOneAndDelete({ _id: id, userId });

const updateCartItem = (id, userId, data) =>
  Cart.findOneAndUpdate({ _id: id, userId }, data, { new: true });

const getProductPopularity = () =>
  Cart.aggregate([
    { $group: { _id: '$productId', cartCount: { $sum: '$quantity' } } },
    { $sort: { cartCount: -1 } }
  ]);

module.exports = {
  addToCart,
  getCartByUser,
  removeFromCart,
  updateCartItem,
  getProductPopularity
};
