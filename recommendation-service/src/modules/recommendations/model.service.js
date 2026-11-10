const { pipeline } = require("@xenova/transformers");

// Holds the *promise* of the loaded model, not the model itself.
// The old code checked `if (!extractor)` and then awaited the (slow) load, so
// every request arriving during that window started its own load. Storing the
// promise synchronously, before any await, means all concurrent callers share
// exactly one load.
let modelPromise = null;

const loadModel = () => {
    if (!modelPromise) {
        console.log("Loading embedding model...");
        modelPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2")
            .then((extractor) => {
                console.log("Embedding model loaded.");
                return extractor;
            })
            .catch((error) => {
                // Don't cache a failure: let the next request retry the load.
                modelPromise = null;
                throw error;
            });
    }
    return modelPromise;
};

module.exports = {
    loadModel,
};
