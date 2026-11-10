const axios = require("axios");
const HttpError = require("../utils/httpError");

const coreService = axios.create({
    baseURL: process.env.CORE_SERVICE_URL,
    timeout: 5000,
});

// ---- Retry with exponential backoff + jitter (GET only: idempotent, safe to repeat)
const MAX_ATTEMPTS = parseInt(process.env.CORE_RETRY_ATTEMPTS, 10) || 3; // total tries
const BASE_DELAY_MS = parseInt(process.env.CORE_RETRY_BASE_MS, 10) || 200;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry only failures that can plausibly succeed next time: no response at all
// (timeout, connection reset/refused), 429, or 5xx. Never retry 4xx like 404/400.
const isRetryable = (error) => {
    if (!error.response) return true;
    const { status } = error.response;
    return status === 429 || status >= 500;
};

const getWithRetry = async (url) => {
    for (let attempt = 1; ; attempt++) {
        try {
            return await coreService.get(url);
        } catch (error) {
            if (attempt >= MAX_ATTEMPTS || !isRetryable(error)) throw error;
            // 200ms, 400ms, 800ms ... plus up to 100ms jitter to avoid retry stampedes
            const delay = BASE_DELAY_MS * 2 ** (attempt - 1) + Math.random() * 100;
            console.warn(`core-service GET ${url} failed (attempt ${attempt}/${MAX_ATTEMPTS}), retrying in ${Math.round(delay)}ms`);
            await sleep(delay);
        }
    }
};

// Convert an axios failure into an HttpError with the right status:
//   core says 404            -> 404 (the product really doesn't exist)
//   core says 400            -> 400 (bad id etc.)
//   timeout / refused / 5xx  -> 502 (our dependency is down; not our bug, not the caller's)
const toHttpError = (error, notFoundMessage) => {
    if (error.response) {
        if (error.response.status === 404) return new HttpError(404, notFoundMessage);
        if (error.response.status === 400) return new HttpError(400, "Invalid request");
    }
    console.error(`core-service call failed: ${error.code || error.response?.status || error.message}`);
    return new HttpError(502, "core-service is unavailable");
};

const getAllProducts = async () => {
    try {
        const response = await getWithRetry("/products");
        return response.data;
    } catch (error) {
        throw toHttpError(error, "Products not found");
    }
};

const getProductById = async (productId) => {
    try {
        // encodeURIComponent: an id can never change which route we hit
        const response = await getWithRetry(`/products/${encodeURIComponent(productId)}`);
        return response.data;
    } catch (error) {
        throw toHttpError(error, "Product not found");
    }
};

// Candidate products for a selected product, filtered/capped by MongoDB in
// core-service. Tunable via env without code changes:
//   CANDIDATE_LIMIT, CANDIDATE_MAX_PRICE_RATIO, CANDIDATE_SAME_CATEGORY
const getCandidates = async (productId) => {
    const params = {};
    if (process.env.CANDIDATE_LIMIT) params.limit = process.env.CANDIDATE_LIMIT;
    params.maxPriceRatio = process.env.CANDIDATE_MAX_PRICE_RATIO || 2;
    if (process.env.CANDIDATE_SAME_CATEGORY === "true") params.sameCategory = true;

    try {
        const response = await getWithRetry(
            `/products/${encodeURIComponent(productId)}/candidates?${new URLSearchParams(params)}`
        );
        return response.data;
    } catch (error) {
        throw toHttpError(error, "Product not found");
    }
};

module.exports = {
    getAllProducts,
    getCandidates,
    getProductById,
};
