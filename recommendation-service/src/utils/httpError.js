// Error carrying an HTTP status, consumed by middlewares/errorHandler.js.
// Mirrors the `err.statusCode` convention used in core-service.
class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.name = "HttpError";
        this.statusCode = statusCode;
    }
}

module.exports = HttpError;
