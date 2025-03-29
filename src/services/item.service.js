const Item = require("../model/item.model");
const { status } = require("http-status");
const { apiError, response } = require("../utils");
const { v4: uuidv4 } = require("uuid");
const redis = require("../config/redis");

const createBulk = async (req, res) => {
  const payload = req.map((item) => ({
    ...item,
    item_id: uuidv4(),
  }));
  try {
    const items = await Item.bulkCreate(payload);
    return items;
  } catch (err) {
    if (err.parent.code == "WARN_DATA_TRUNCATED") {
      const columnName = err.parent.sqlMessage.match(/column '(\w+)'/)[1];
      return apiError(
        res,
        status.BAD_REQUEST,
        `Incorrect ENUM value for column '${columnName}'`
      );
    }

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
  createBulk,
};
