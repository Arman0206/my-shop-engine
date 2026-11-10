const Product = require('./product.model');

const createProduct = (data) => Product.create(data);

const getAllProducts = () => Product.find();

const getProductById = (id) => Product.findById(id);

const updateProduct = (id, data) => Product.findByIdAndUpdate(id, data, { new: true });

const deleteProduct = (id) => Product.findByIdAndDelete(id);

// Atomic increment: safe under concurrent requests (no read-modify-write race).
// Returns the updated product, or null if it does not exist.
const incrementViews = (id) =>
  Product.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true }).select('views');

const MAX_LIMIT = 500;
const DEFAULT_LIMIT = 200;

// Candidate generation for recommendations, done by MongoDB instead of
// shipping the whole catalog to the caller.
//   - excludes the product itself
//   - price ceiling: price <= selected.price * maxPriceRatio (no floor on purpose:
//     cheap accessories are exactly what cross-sell wants)
//   - optional same-category restriction (off by default: laptop -> mouse crosses categories)
//   - ordered by views desc, rating desc and capped at `limit`
//   - never returns the heavy `embedding` array
// Returns null if the selected product doesn't exist.
const getCandidates = async (id, { limit, maxPriceRatio, sameCategory } = {}) => {
  const selected = await Product.findById(id).select('price category').lean();
  if (!selected) return null;

  const filter = { _id: { $ne: selected._id } };
  if (maxPriceRatio > 0 && selected.price > 0) {
    filter.price = { $lte: selected.price * maxPriceRatio };
  }
  if (sameCategory) filter.category = selected.category;

  const cap = Math.min(Math.max(parseInt(limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);

  return Product.find(filter)
    .sort({ views: -1, rating: -1, _id: 1 })
    .limit(cap)
    .select('-embedding -__v')
    .lean();
};

module.exports = {
  getCandidates,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  incrementViews
};
