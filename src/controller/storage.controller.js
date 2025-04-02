const { status } = require("http-status");
const { catchAsync } = require("../utils");
const storageService = require("../services/storage.service");

const upload = catchAsync(async (req, res) => {
  const result = await storageService.create(req, res);
  res.status(status.OK).send(result);
});

const uploadBulk = catchAsync(async (req, res) => {
  const result = await storageService.createBulk(req, res);
  res.status(status.OK).send(result);
});

module.exports = {
  upload,
  uploadBulk,
};
