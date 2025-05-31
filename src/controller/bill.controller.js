const { status } = require("http-status");
const { catchAsync, response, apiError } = require("../utils");
const billService = require("../services/bill.service");

const getAll = catchAsync(async (req, res) => {
  try {
    const result = await billService.getAll(req.body, res);
    return response(res, result, "Successfully list the bills");
  } catch (err) {
    return apiError(res, err);
  }
});

const create = catchAsync(async (req, res) => {
  try {
    const result = await billService.create(req.body, res);
    return response(res, result, "Successfully create a bill");
  } catch (err) {
    return apiError(res, err);
  }
});

const scan = catchAsync(async (req, res) => {
  try {
    const result = await billService.scan(req.body.url, res);
    return response(res, result, "Successfully scan the bill");
  } catch (err) {
    return apiError(res, err);
  }
});

const uploadScan = catchAsync(async (req, res) => {
  try {
    const result = await billService.uploadScan(req.files.file);
    return response(res, result, "Successfully scan the bill");
  } catch (err) {
    return apiError(res, err);
  }
});

const getOne = catchAsync(async (req, res) => {
  try {
    const result = await billService.getOne(req.params.id);
    return response(res, result, "Successfully get detail of the bill");
  } catch (err) {
    return apiError(res, err);
  }
});

const deleteOne = catchAsync(async (req, res) => {
  try {
    const result = await billService.deleteOne(req.params.id);
    return response(res, result, "Successfully delete the bill");
  } catch (err) {
    return apiError(res, err);
  }
});

const updatePayment = catchAsync(async (req, res) => {
  try {
    const result = await billService.updatePayment(
      req.params.id,
      req.body.confirm_payment
    );
    return response(res, result, "Successfully update the payment");
  } catch (err) {
    return apiError(res, err);
  }
});

module.exports = {
  getAll,
  create,
  getOne,
  deleteOne,
  updatePayment,
  scan,
  uploadScan,
};
