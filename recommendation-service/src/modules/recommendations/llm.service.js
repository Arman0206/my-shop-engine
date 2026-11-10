const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const MODELS = [
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
];

const generateReasons = async (prompt) => {

    for (const model of MODELS) {

        try {

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
            });

            let text = response.text.trim();

            // Remove markdown if Gemini returns ```json ... ```
            text = text
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .trim();

            return JSON.parse(text);

        } catch (error) {

            console.log(`${model} failed: ${error.status || error.message}`);

        }

    }

    return [];

};

module.exports = {
    generateReasons,
};
