const { loadModel } = require("./model.service");
const LRUCache = require("../../utils/lruCache");

// Cap memory: each entry is a 384-dim Float32Array (~1.5 KB) plus its key text,
// so the default 5000 entries is on the order of 10-15 MB.
const MAX_ENTRIES = parseInt(process.env.EMBEDDING_CACHE_MAX, 10) || 5000;

// Maps input text -> Promise<Float32Array>.
// Caching the *promise* (not just the result) means concurrent requests for the
// same text share one inference instead of each starting their own.
const embeddingCache = new LRUCache(MAX_ENTRIES);

const computeEmbedding = async (text) => {
    const extractor = await loadModel();
    const output = await extractor(text, {
        pooling: "mean",
        normalize: true,
    });
    // Copy: don't keep a view into the tensor's underlying buffer alive.
    return new Float32Array(output.data);
};

const getEmbedding = (text) => {
    const cached = embeddingCache.get(text);
    if (cached) return cached;

    const promise = computeEmbedding(text);
    embeddingCache.set(text, promise);

    // Never keep a failed computation cached, or one transient error would
    // poison that text until it gets evicted.
    promise.catch(() => {
        if (embeddingCache.peek(text) === promise) {
            embeddingCache.delete(text);
        }
    });

    return promise;
};

module.exports = {
    getEmbedding,
    // exposed for tests / diagnostics
    _cache: embeddingCache,
};
