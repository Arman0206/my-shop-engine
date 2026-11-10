const { getEmbedding } = require("./embedding.service");

const cosineSimilarity = (a, b) => {
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

const buildProductText = (product) => {
    // Collapse whitespace so cache keys are compact and stable. The tokenizer
    // ignores extra whitespace, so the embedding itself is unchanged.
    return [
        product.productName,
        product.category,
        product.brand,
        product.description || "",
    ]
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
};

const calculateSimilarity = async (product1, product2) => {
    const embedding1 = await getEmbedding(
        buildProductText(product1)
    );
    const embedding2 = await getEmbedding(
        buildProductText(product2)
    );
    return cosineSimilarity(embedding1, embedding2);
};

module.exports = {
    calculateSimilarity,
};
