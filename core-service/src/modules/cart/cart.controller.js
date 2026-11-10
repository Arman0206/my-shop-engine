
const mongoose = require('mongoose');
const cartService = require('./cart.service');

const addToCart = async (req, res, next) => {
  try {
    // userId comes from the verified token, never from the request body, so a
    // user can only ever modify their own cart.
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: 'A valid productId is required' });
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'quantity must be a positive integer' });
    }

    // Adding an item that is already in the cart increments its quantity.
    const { item, created } = await cartService.addToCart({ userId, productId, quantity });
    res.status(created ? 201 : 200).json(item);
  } catch (error) {
    next(error);
  }
};

const getCart = async (req, res, next) => {
  try {
    const items = await cartService.getCartByUser(req.user.id);
    res.json(items);
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const item = await cartService.removeFromCart(req.params.id, req.user.id);
    if (!item) return res.status(404).json({ message: 'Cart item not found' });
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    next(error);
  }
};

const getPopularity = async (req, res, next) => {
  try {
    const popularity = await cartService.getProductPopularity();
    res.json(popularity);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToCart,
  getCart,
  removeFromCart,
  getPopularity
};