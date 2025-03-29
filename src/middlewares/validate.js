const User = require("../model/user.model");
const { status } = require("http-status");
const { apiError, response } = require("../utils");
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.format() });
  }
  next();
};

const validateToken = () => {
  return async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      return apiError(res, status.UNAUTHORIZED, "Token not found");
    }
    const result = await User.compareAccessToken(token.split(" ")[1]);
    if (result instanceof Error) {
      return apiError(res, status.UNAUTHORIZED, "Invalid or expired token");
    }
    next();
  };
};
module.exports = { validate, validateToken };
