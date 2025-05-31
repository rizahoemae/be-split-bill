const Item = require("../model/item.model");
const { status } = require("http-status");
const { v4: uuidv4 } = require("uuid");
const redis = require("../config/redis");

const createBulk = async (req, res) => {
  try {
    const payload = req.map((item) => ({
      ...item,
      item_id: uuidv4(),
    }));
    const items = await Item.bulkCreate(payload);
    return items;
  } catch (err) {
    if (err.parent.code == "WARN_DATA_TRUNCATED") {
      const columnName = err.parent.sqlMessage.match(/column '(\w+)'/)[1];
      const error = new Error(
        `Incorrect ENUM value for column '${columnName}'`
      );
      error.statusCode = status.BAD_REQUEST;
      throw error;
    }

    if (err.name === "SequelizeValidationError") {
      const errObj = {};
      err.errors.map((er) => {
        errObj[er.path] = er.message;
      });
      const error = new Error(errObj);
      error.statusCode = status.BAD_REQUEST;
      throw error;
    }
  }
};

module.exports = {
  createBulk,
};
