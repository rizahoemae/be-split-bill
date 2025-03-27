const { status } = require("http-status");
const { catchAsync } = require("../utils");
const userService = require("../services/user.service");
const authService = require("../services/auth.service");

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body, res);
  res.status(status.OK).send(user);
});

const login = catchAsync(async (req, res) => {
  const result = await authService.loginUser(req.body, res);
  res.status(status.OK).send(result);
});

const refresh = catchAsync(async (req, res) => {
  const result = await authService.refreshToken(req.body, res);
  res.status(status.OK).send(result);
});

module.exports = {
  register,
  login,
  refresh
};
