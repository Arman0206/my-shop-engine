const {
    getCandidates,
    getProductById,
} = require("../../clients/coreServiceClient");

const {
    calculateScore,
} = require("./scoring.service");

const {
    rankProducts,
} = require("./ranking.service");

const {
    generateRecommendationReasons,
} = require("./reason.service");

const LRUCache = require("../../utils/lruCache");

// Finished recommendation sets, per product, with a short TTL.
// Repeat views of the same product skip candidate fetch, scoring CPU and the
// Gemini call entirely. Per-process cache: with several instances each keeps its
// own (use Redis if you need them to share).
const TTL_MS = parseInt(process.env.RECOMMENDATION_CACHE_TTL_MS, 10) || 5 * 60 * 1000;
const MAX_ENTRIES = parseInt(process.env.RECOMMENDATION_CACHE_MAX, 10) || 500;
const resultCache = new LRUCache(MAX_ENTRIES);

const computeRecommendations = async (productId) => {

    // Independent fetches, run concurrently. Candidates are pre-filtered and
    // capped by MongoDB (see core-service getCandidates), so scoring cost stays
    // bounded as the catalog grows instead of scaling with its full size.
    const [selectedProduct, products] = await Promise.all([
        getProductById(productId),
        getCandidates(productId),
    ]);

    // Calculate score
    const scoredProducts = await Promise.all(
        products
            .filter(product => product._id !== productId)
            .map(async (product) => ({
                ...product,
                score: await calculateScore(selectedProduct, product),
            }))
    );

    // Top 5 recommendations
    const rankedProducts = rankProducts(scoredProducts);

    // Single Gemini API Call (skipped when there is nothing to explain)
    const reasons = rankedProducts.length
        ? await generateRecommendationReasons(selectedProduct, rankedProducts)
        : [];

    // Map reasons with products
    const recommendations = rankedProducts.map((product) => {

        const {
            embedding,
            __v,
            ...cleanProduct
        } = product;

        const matchedReason = reasons.find(
            item => item.productId === product._id
        );

        return {
            ...cleanProduct,
            reason: matchedReason
                ? matchedReason.reason
                : "Recommended based on AI semantic similarity.",
        };
    });

    // Clean selected product
    const {
        embedding,
        __v,
        ...cleanSelectedProduct
    } = selectedProduct;

    return {
        result: {
            selectedProduct: cleanSelectedProduct,
            recommendations,
        },
        // Gemini failed/returned nothing, so every reason is the generic fallback.
        // Don't let that degraded answer stick around for the whole TTL.
        degraded: rankedProducts.length > 0 && reasons.length === 0,
    };
};

const getRecommendations = (productId) => {
    const entry = resultCache.get(productId);
    if (entry && entry.expiresAt > Date.now()) return entry.promise;

    // Cache the promise, so concurrent requests for the same product share one
    // computation instead of each running the whole pipeline.
    const newEntry = {
        expiresAt: Date.now() + TTL_MS,
        promise: computeRecommendations(productId).then(({ result, degraded }) => {
            if (degraded && resultCache.peek(productId) === newEntry) {
                resultCache.delete(productId);
            }
            return result;
        }),
    };
    resultCache.set(productId, newEntry);

    // Never cache failures (404 for a missing product, 502 from core, ...).
    newEntry.promise.catch(() => {
        if (resultCache.peek(productId) === newEntry) resultCache.delete(productId);
    });

    return newEntry.promise;
};

module.exports = {
    getRecommendations,
    _resultCache: resultCache,
};