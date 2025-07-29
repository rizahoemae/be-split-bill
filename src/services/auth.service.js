const User = require("../model/user.model");
const { status } = require("http-status");
const { v4: uuidv4 } = require("uuid");
const redis = require("../config/redis");

const setToken = async (form) => {
  try {
    const payload = {
      email: form.email,
      user_id: form.user_id,
    };
    const refresh_token = User.generateRefreshToken(payload);
    await redis.set(form.email, refresh_token);
    await redis.expire(form.email, 604800);
    return {
      access_token: User.generateAccessToken(payload),
      refresh_token: refresh_token,
    };
  } catch (err) {
    throw err;
  }
};

const loginUser = async (form) => {
  try {
    const user = await User.findOne({ where: { email: form.email } });
    if (!user) {
      const error = new Error("Email not found");
      error.statusCode = status.NOT_FOUND;
      throw error;
    }
    const match = await User.comparePassword(form.password, user.password);
    if (!match) {
      const error = new Error("Password incorrect");
      error.statusCode = status.UNAUTHORIZED;
      throw error;
    }
    const userObj = user.dataValues;
    if (Object.keys(userObj).length === 0) {
      const error = new Error("User not found");
      error.statusCode = status.NOT_FOUND;
      throw error;
    }
    const token = await setToken(userObj);
    const { name, email, phone } = user;
    return {
      ...token,
      user: {
        name,
        email,
        phone,
      },
    };
  } catch (err) {
    throw err;
  }
};

const refreshToken = async (form) => {
  try {
    const match = await User.compareRefreshToken(form.refresh_token);
    if (!match) {
      const error = new Error("Invalid refresh token");
      error.statusCode = status.UNAUTHORIZED;
      throw error;
    }
    const user = await User.findOne({ where: { email: match.email } });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = status.NOT_FOUND;
      throw error;
    }
    const redisToken = await redis.get(match.email);
    if (redisToken !== form.refresh_token) {
      const error = new Error("Invalid refresh token or expired");
      error.statusCode = status.UNAUTHORIZED;
      throw error;
    }
    const userObj = user.dataValues;
    const token = await setToken(userObj);
    return token;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  loginUser,
  refreshToken,
};
