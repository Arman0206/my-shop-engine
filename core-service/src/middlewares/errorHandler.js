// Translate well-known library errors into proper client-facing status codes.
// Anything else keeps err.statusCode (if set) or falls back to 500.
const resolveStatus = (err) => {
  if (err.statusCode) return err.statusCode;
  if (err.name === 'CastError') return 400;        // malformed ObjectId, e.g. /products/abc
  if (err.name === 'ValidationError') return 400;  // schema validation failed
  if (err.code === 11000) return 409;              // duplicate key (unique index)
  return 500;
};

const errorHandler = (err, req, res, next) => {
  const status = resolveStatus(err);
  if (status >= 500) console.error(err.stack);

  // Don't leak internals for unexpected server errors in production.
  const message =
    status >= 500 && process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.name === 'CastError'
        ? 'Invalid id'
        : err.message || 'Internal Server Error';

  res.status(status).json({ message });
};

module.exports = errorHandler;
