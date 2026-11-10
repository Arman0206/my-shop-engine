const express = require("express");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const {
    recommendProducts,
} = require("./recommendation.controller");
const { requireAuth } = require("../../middlewares/auth");

// Each uncached request costs CPU and (maybe) a paid LLM call, so cap it per user.
// Runs after requireAuth, so the key is the user id rather than a shared IP.
const recommendationLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: parseInt(process.env.RECOMMENDATION_RATE_LIMIT, 10) || 30,
    keyGenerator: (req) => req.user.id,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please slow down" },
});

router.get("/:productId", requireAuth, recommendationLimiter, recommendProducts);

module.exports = router;
