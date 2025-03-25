// const { ApiError } = require("../utils");
const User = require("../model/user.model");
const { status } = require("http-status");
const { apiError } = require("../utils");
const { v4: uuidv4 } = require("uuid");

const createUser = async (req, res) => {
  if (await User.alreadyExists(req.email)) {
    apiError(res, status.CONFLICT, "Email already taken");
    // res.status(status.CONFLICT).send("Email already taken");
    // throw new ApiError(status.CONFLICT, "Email already taken");
  }
  const payload = { user_id: uuidv4(), ...req };
  const resp = await User.create(payload);
  return resp;
};

module.exports = {
  createUser,
};
