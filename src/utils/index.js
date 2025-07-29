const { status } = require("http-status");
const User = require("../model/user.model");
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

const apiError = (res, error) => {
  return res.status(error.statusCode || 500).send({
    status_code: error.statusCode || 500,
    message: error.message || "Internal Server Error",
    ...(error.stack ? { trace: error.stack } : {}),
  });
};

const response = (
  res,
  result,
  pagination = {},
  message = status["200_MESSAGE"]
) => {
  res.status(200).send({
    status_code: 200,
    message: message,
    ...(Object.keys(pagination).length > 0 ? { pagination: pagination } : {}),
    result: result,
  });
  throw new Error(message);
};

const whoami = async (header) => {
  const token = header.authorization;
  const result = await User.compareAccessToken(token.split(" ")[1]);
  return result;
};
module.exports = { catchAsync, apiError, response, whoami };
