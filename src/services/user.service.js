const User = require("../model/user.model");
const { status } = require("http-status");
const { v4: uuidv4 } = require("uuid");

const createUser = async (form) => {
  try {
    if (await User.alreadyExists(form.email)) {
      const error = new Error("Email already taken");
      error.statusCode = status.CONFLICT;
      throw error;
    }
    const hashedPassword = await User.generatePassword(form.password);
    const payload = {
      ...form,
      user_id: uuidv4(),
      password: hashedPassword,
    };
    const resp = await User.create(payload);
    return resp;
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      const errObj = {};
      err.errors.map((er) => {
        errObj[er.path] = er.message;
      });
      const error = new Error(errObj);
      error.statusCode = status.BAD_REQUEST;
      throw error;
    }
    throw err;
  }
};

module.exports = {
  createUser,
};
