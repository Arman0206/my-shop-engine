const productService = require('./product.service');

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

// POST /products/:id/view  -- records one genuine storefront view.
// Deliberately NOT done inside GET /products/:id: recommendation-service reads
// that route on every request, which would inflate views with internal traffic.
const trackView = async (req, res, next) => {
  try {
    const product = await productService.incrementViews(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ _id: product._id, views: product.views });
  } catch (error) {
    next(error);
  }
};

// GET /products/:id/candidates?limit=200&maxPriceRatio=2&sameCategory=true
const getCandidates = async (req, res, next) => {
  try {
    const { limit, maxPriceRatio, sameCategory } = req.query;
    const candidates = await productService.getCandidates(req.params.id, {
      limit,
      maxPriceRatio: Number(maxPriceRatio),
      sameCategory: sameCategory === 'true'
    });
    if (!candidates) return res.status(404).json({ message: 'Product not found' });
    res.json(candidates);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCandidates,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  trackView
};