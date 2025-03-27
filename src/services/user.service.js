// const { ApiError } = require("../utils");
const User = require("../model/user.model");
const { status } = require("http-status");
const { apiError, response } = require("../utils");
const { v4: uuidv4 } = require("uuid");

const createUser = async (req, res) => {
  if (await User.alreadyExists(req.email)) {
    return apiError(res, status.CONFLICT, "Email already taken");
  }
  const hashedPassword = await User.generatePassword(req.password);
  const payload = {
    ...req,
    user_id: uuidv4(),
    password: hashedPassword,
  };
  try {
    const resp = await User.create(payload);
    return response(res, resp);
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      const errObj = {};
      err.errors.map((er) => {
        errObj[er.path] = er.message;
      });
      return apiError(res, status.BAD_REQUEST, errObj);
    }
  }
};

module.exports = {
  createUser,
};
