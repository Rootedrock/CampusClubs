const { ApiError } = require("./errorHandler");

/**
 * Protects admin-only routes (e.g. viewing/deleting suggestions).
 * Expects header:  x-api-key: <ADMIN_API_KEY>
 */
function requireAdmin(req, res, next) {
  const expectedKey = process.env.ADMIN_API_KEY;
  const providedKey = req.header("x-api-key");

  if (!expectedKey) {
    return next(new ApiError(500, "ADMIN_API_KEY is not configured on the server"));
  }

  if (!providedKey || providedKey !== expectedKey) {
    return next(new ApiError(401, "Missing or invalid API key"));
  }

  next();
}

module.exports = requireAdmin;
