const { buildPrompt } = require("./prompt.service");
const { generateReasons } = require("./llm.service");

const generateRecommendationReasons = async (
    selectedProduct,
    recommendations
) => {
    const prompt = buildPrompt(
        selectedProduct,
        recommendations
    );

    const reasons = await generateReasons(prompt);

    return reasons;
};

module.exports = {
    generateRecommendationReasons,
};
