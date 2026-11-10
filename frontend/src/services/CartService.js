import { coreApi } from "./apiClient";

// The server identifies the user from the auth token, so no userId is sent.
const CartService = {
  getCart: async () => {
    const res = await coreApi.get("/cart");
    return res.data;
  },
  addToCart: async (productId, quantity = 1) => {
    const res = await coreApi.post("/cart", { productId, quantity });
    return res.data;
  },
  removeFromCart: async (cartItemId) => {
    const res = await coreApi.delete(`/cart/${cartItemId}`);
    return res.data;
  },
};

export default CartService;
