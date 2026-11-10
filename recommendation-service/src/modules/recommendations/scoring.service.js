const { calculateSimilarity } = require("./similarity.service");

const calculateScore = async (selectedProduct, candidateProduct) => {
    let score = 0;

    // ===========================
    // AI Similarity (40%)
    // ===========================
    const similarity = await calculateSimilarity(
        selectedProduct,
        candidateProduct
    );

    score += similarity * 40;

    // ===========================
    // Rating (20%)
    // Rating out of 5
    // ===========================
    score += (candidateProduct.rating / 5) * 20;

    // ===========================
    // Price Compatibility (10%)
    // ===========================
    const priceDifference = Math.abs(
        selectedProduct.price - candidateProduct.price
    );

    if (priceDifference <= 1000) {
        score += 10;
    }

    // ===========================
    // Views (30%)
    // ===========================
    const views = candidateProduct.views || 0;

    score += Math.min((views / 1000) * 30, 30);

    return Number(score.toFixed(2));
};

module.exports = {
    calculateScore,
};