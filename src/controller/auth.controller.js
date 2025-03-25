const { status } = require("http-status");
const { catchAsync } = require("../utils");
const userService = require("../services/user.service");

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body, res);
  res.status(status.OK).send(user);
});

module.exports = {
  register,
};
