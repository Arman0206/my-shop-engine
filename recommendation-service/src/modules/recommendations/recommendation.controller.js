const { getRecommendations } = require("./recommendation.service");
const HttpError = require("../../utils/httpError");

// Mongo ObjectId: 24 hex chars. Rejecting anything else early gives callers a
// clean 400 and keeps junk out of the URL we build for core-service.
const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

const recommendProducts = async (req, res, next) => {
    try {
        const { productId } = req.params;

        if (!OBJECT_ID.test(productId)) {
            throw new HttpError(400, "Invalid product id");
        }

        const result = await getRecommendations(productId);
        res.status(200).json(result);
    } catch (error) {
        next(error); // errorHandler decides 400 / 404 / 502 / 500
    }
};

module.exports = {
    recommendProducts,
};
