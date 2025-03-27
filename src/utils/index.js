const { status } = require("http-status");

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

const apiError = (res, code, message) => {
  return res.status(code).send({
    status_code: code,
    message: message,
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
