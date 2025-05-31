const { status } = require("http-status");
const { catchAsync, response, apiError } = require("../utils");
const userService = require("../services/user.service");
const authService = require("../services/auth.service");

const register = catchAsync(async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    return response(res, user, "Successfully create a user");
  } catch (err) {
    return apiError(res, err);
  }
});

const login = catchAsync(async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);
    return response(res, result, "Successfully logged in");
  } catch (err) {
    return apiError(res, err);
  }
});

const refresh = catchAsync(async (req, res) => {
  try {
    const result = await authService.refreshToken(req.body, res);
    return response(res, result, "Successfully refreshed token");
  } catch (err) {
    return apiError(res, err);
  }
});

module.exports = {
  register,
  login,
  refresh,
};
