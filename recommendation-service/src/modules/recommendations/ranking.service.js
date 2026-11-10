const rankProducts = (products) => {
    return products
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
};

module.exports = {
    rankProducts,
};