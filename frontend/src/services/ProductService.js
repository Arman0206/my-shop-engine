import { coreApi } from "./apiClient";

// One view per product per browser session. Module-level so it survives
// component re-mounts (and React StrictMode's double mount in dev).
const viewedThisSession = new Set();

const ProductService = {
  getAllProducts: async () => {
    const res = await coreApi.get("/products");
    return res.data;
  },
  getProductById: async (id) => {
    const res = await coreApi.get(`/products/${id}`);
    return res.data;
  },
  // Fire-and-forget: a failed view ping must never break the UI.
  trackView: (id) => {
    if (viewedThisSession.has(id)) return;
    viewedThisSession.add(id);
    coreApi.post(`/products/${id}/view`).catch(() => viewedThisSession.delete(id));
  },
  createProduct: async (product) => {
    const res = await coreApi.post("/products", product);
    return res.data;
  },
};

export default ProductService;