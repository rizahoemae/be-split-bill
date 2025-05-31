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
      const error = new Error("Token not found");
      return apiError(res, error);
    }
    const result = await User.compareAccessToken(token.split(" ")[1]);
    if (result instanceof Error) {
      if (result.message == "jwt expired") {
        result.message = "Invalid or expired token";
        result.statusCode = status.UNAUTHORIZED;
      }
      return apiError(res, result);
    }
    next();
  };
};
module.exports = { validate, validateToken };
