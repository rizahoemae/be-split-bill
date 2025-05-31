const { status } = require("http-status");
const { catchAsync, response, apiError } = require("../utils");
const storageService = require("../services/storage.service");

const upload = catchAsync(async (req, res) => {
  try {
    const result = await storageService.create(
      req.files.files || req.files.file
    );
    return response(res, result);
  } catch (err) {
    return apiError(res, err);
  }
});

const uploadBulk = catchAsync(async (req, res) => {
  const result = await storageService.createBulk(req, res);
  res.status(status.OK).send(result);
});

module.exports = {
  upload,
  uploadBulk,
};
