const Bill = require("../model/bill.model");
const { status } = require("http-status");
const { apiError, response } = require("../utils");
const { v4: uuidv4 } = require("uuid");
const redis = require("../config/redis");
const Item = require("../model/item.model");
const Participant = require("../model/participant.model");
const BillShare = require("../model/bill-share.model");
const sequelize = require("../config/db");

const getAll = async (req, res) => {
  const bills = await Bill.findAll({ where: { is_deleted: 0 } });
  if (!bills) {
    return apiError(res, status.NOT_FOUND, "No bills found");
  }
  return response(res, bills);
};

const create = async (req, res) => {
  const payload = {
    ...req,
    bill_id: uuidv4(),
  };
  try {
    const result = await sequelize.transaction(async (t) => {
      //create bill
      const bills = await Bill.create(payload, { transaction: t });

      //create items
      const items = payload.items.map((item) => ({
        ...item,
        item_id: uuidv4(),
        bill_id: payload.bill_id,
      }));
      await Item.bulkCreate(items, { transaction: t });

      //create bill share
      const billShare = items.flatMap((item) =>
        item.payers.map((payer) => ({
          ...payer,
          bill_share_id: uuidv4(),
          bill_id: payload.bill_id,
          item_id: item.item_id,
        }))
      );

      await BillShare.bulkCreate(billShare, { transaction: t });

      //create participants
      const participants = payload.participants.map((participant) => ({
        ...participant,
        participant_id: uuidv4(),
        bill_id: payload.bill_id,
      }));
      await Participant.bulkCreate(participants, { transaction: t });

       for (const participant of payload.participants) {
        const totalDue = await BillShare.sum("amount", {
          where: {
            user_id: participant.user_id,
            bill_id: payload.bill_id,
          },
          transaction: t, 
        });

        await Participant.update(
          { total_due: totalDue || 0 },
          {
            where: {
              user_id: participant.user_id,
              bill_id: payload.bill_id,
            },
            transaction: t,
          }
        );
      }
      return bills;
    });
    return response(res, result);
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

    return apiError(
      res,
      status.BAD_REQUEST,
      err.message || "Something went wrong"
    );
  }
};

const getOne = async (req, res) => {
  const bills = await findOne(req, res);
  // const bills = await Bill.findOne({ bill_id: req.id });
  if (!bills) {
    return apiError(res, status.NOT_FOUND, "No bill found");
  }
  return response(res, bills);
};

const findOne = async (req, res) => {
  const bills = await Bill.findOne({
    where: { bill_id: req.id, is_deleted: 0 },
  });
  if (!bills) {
    return apiError(res, status.NOT_FOUND, "No bill found");
  }
  return bills;
};

const updateOne = async (req, res) => {
  const bills = await findOne(req, res);
  if (!bills) {
    return apiError(res, status.NOT_FOUND, "No bill found");
  }
  const update = await bills.update(req.body, { where: { bill_id: req.id } });
  return update;
};

const deleteOne = async (req, res) => {
  const bill = await updateOne({ id: req.id, body: { is_deleted: 1 } }, res);
  if (!bill) {
    return apiError(res, status.NOT_FOUND, "No bill found");
  }
  try {
    const result = await sequelize.transaction(async (t) => {
      await Item.update(
        { is_deleted: 1 },
        { where: { bill_id: req.id } },
        { transaction: t }
      );
      const update = bill.update(
        { is_deleted: 1 },
        { where: { bill_id: req.id } },
        { transaction: t }
      );
      return update;
    });
    return response(res, "Bill deleted successfully");
  } catch (err) {
    console.log({ err });
    // return apiError(res, status.NOT_FOUND, "No bill found");
  }
};

module.exports = {
  getAll,
  create,
  getOne,
  deleteOne,
  updateOne,
};
