const { status } = require("http-status");

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

const response = (res, result, message = status["200_MESSAGE"]) => {
  res.status(200).send({
    status_code: 200,
    message: message,
    result: result,
  });
  throw new Error(message);
};
module.exports = { catchAsync, apiError, response };
