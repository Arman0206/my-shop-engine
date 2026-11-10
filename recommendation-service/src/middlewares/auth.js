const jwt = require("jsonwebtoken");

// Verifies the JWT issued by core-service (same JWT_SECRET) and sets req.user.
// This service never issues tokens and never touches user data; it only checks
// that the caller is logged in.
const requireAuth = (req, res, next) => {
    const [scheme, token] = (req.headers.authorization || "").split(" ");
    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ message: "Authentication required" });
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
        req.user = { id: payload.sub, role: payload.role };
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = { requireAuth };
