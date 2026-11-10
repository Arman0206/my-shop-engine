require("dotenv").config();

// Must match core-service's JWT_SECRET. Fail fast rather than run unauthenticated.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error("JWT_SECRET must be set (same value as core-service) and at least 32 characters.");
    process.exit(1);
}

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5002;

// The embedding model is NOT loaded here. It is loaded lazily on the first
// request that needs an embedding (see model.service.js), so startup is fast
// and doesn't run a throwaway similarity computation.
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Recommendation Service running on port ${PORT}`);
    });
};

startServer();
