const { status } = require("http-status");
const { catchAsync } = require("../utils");
const billService = require("../services/bill.service");

const getAll = catchAsync(async (req, res) => {
  const user = await billService.getAll(req.body, res);
  res.status(status.OK).send(user);
});

const create = catchAsync(async (req, res) => {
  const user = await billService.create(req.body, res);
  res.status(status.OK).send(user);
});

const scan = catchAsync(async (req, res) => {
  const user = await billService.scan(req.body, res);
  res.status(status.OK).send(user);
});

const getOne = catchAsync(async (req, res) => {
  const user = await billService.getOne(req.params, res);
  res.status(status.OK).send(user);
});

const deleteOne = catchAsync(async (req, res) => {
  const user = await billService.deleteOne(req.params, res);
  res.status(status.OK).send(user);
});

const updatePayment = catchAsync(async (req, res) => {
  const user = await billService.updatePayment(req, res);
  res.status(status.OK).send(user);
});

module.exports = {
  getAll,
  create,
  getOne,
  deleteOne,
  updatePayment,
  scan
};
