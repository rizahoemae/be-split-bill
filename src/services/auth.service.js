// const { ApiError } = require("../utils");
const User = require("../model/user.model");
const { status } = require("http-status");
const { apiError, response } = require("../utils");
const { v4: uuidv4 } = require("uuid");
const redis = require("../config/redis");

const setToken = async (res, userObj, message) => {
  const payload = {
    email: userObj.email,
  };
  const refresh_token = User.generateRefreshToken(payload);
  await redis.set(userObj.email, refresh_token);
  await redis.expire(userObj.email, 604800); // 7 days
  return response(
    res,
    {
      access_token: User.generateAccessToken(payload),
      refresh_token: refresh_token,
    },
    message
  );
};

const loginUser = async (req, res) => {
  const user = await User.findOne({ where: { email: req.email } });
  if (!user) {
    return apiError(res, status.NOT_FOUND, "Email not found");
  }
  const match = await User.comparePassword(req.password, user.password);
  if (!match) {
    return apiError(res, status.UNAUTHORIZED, "Password incorrect");
  }
  const userObj = user.dataValues;
  if (Object.keys(userObj).length === 0) {
    return apiError(res, status.NOT_FOUND, "User not found");
  }
  await setToken(res, userObj, "Successfully logged in");
};

const refreshToken = async (req, res) => {
  const match = await User.compareRefreshToken(req.refresh_token);
  if (!match) {
    return apiError(res, status.UNAUTHORIZED, "Invalid refresh token");
  }
  const user = await User.findOne({ where: { email: match.email } });
  if (!user) {
    return apiError(res, status.NOT_FOUND, "User not found");
  }
  const redisToken = await redis.get(match.email);
  if (redisToken !== req.refresh_token) {
    return apiError(
      res,
      status.UNAUTHORIZED,
      "Invalid refresh token or expired"
    );
  }
  const userObj = user.dataValues;
  await setToken(res, userObj, "Successfully refreshed token");
};

module.exports = {
  loginUser,
  refreshToken,
};
