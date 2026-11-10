const express = require("express");
const cors = require("cors");

const recommendationRoutes = require("./modules/recommendations/recommendation.routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Only the configured frontend origin(s) may call this API from a browser.
// CORS_ORIGIN="https://shop.example.com". Dev default: the Vite dev server.
const allowedOrigins = (process.env.CORS_ORIGIN || (process.env.NODE_ENV === "production" ? "" : "http://localhost:5173"))
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "100kb" }));

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "recommendation-service",
    });
});

app.use("/api/recommendations", recommendationRoutes);

app.use(errorHandler);

module.exports = app;