import { recommendationApi } from "./apiClient";

const RecommendationService = {
  // Returns { selectedProduct, recommendations: [{ ..product, score, reason }] }
  getRecommendations: async (productId) => {
    const res = await recommendationApi.get(`/api/recommendations/${productId}`);
    return res.data;
  },
};

export default RecommendationService;