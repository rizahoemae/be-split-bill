const Bill = require("../model/bill.model");
const { status } = require("http-status");
const { apiError, response } = require("../utils");
const { v4: uuidv4 } = require("uuid");
const redis = require("../config/redis");
const Item = require("../model/item.model");
// const Participant = require("../model/participant.model");
const BillShare = require("../model/bill-share.model");
const sequelize = require("../config/db");
const User = require("../model/user.model");
const {GoogleGenAI, Type} = require('@google/genai')
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

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
      // const participants = payload.participants.map((participant) => ({
      //   ...participant,
      //   participant_id: uuidv4(),
      //   bill_id: payload.bill_id,
      // }));
      // await Participant.bulkCreate(participants, { transaction: t });

      // for (const participant of payload.participants) {
      //   const totalDue = await BillShare.sum("amount", {
      //     where: {
      //       user_id: participant.user_id,
      //       bill_id: payload.bill_id,
      //     },
      //     transaction: t,
      //   });

      //   await Participant.update(
      //     { total_due: totalDue || 0 },
      //     {
      //       where: {
      //         user_id: participant.user_id,
      //         bill_id: payload.bill_id,
      //       },
      //       transaction: t,
      //     }
      //   );
      // }
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

const scan = async (req, res) => {
  try {
    const imageFetch = await fetch(req.url);
    const imageArrayBuffer = await imageFetch.arrayBuffer();
    const base64ImageData = Buffer.from(imageArrayBuffer).toString("base64");
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64ImageData,
          },
        },
        { text: "Extract information from this image" },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            products: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                  },
                  quantity: {
                    type: Type.NUMBER,
                  },
                  price: {
                    type: Type.NUMBER,
                  },
                  total: {
                    type: Type.NUMBER,
                  },
                },
              },
            },
            payment_detail: {
              type: Type.OBJECT,
              properties: {
                subtotal: {
                  type: Type.NUMBER,
                },
                tax: {
                  type: Type.NUMBER,
                },
                discount: {
                  type: Type.NUMBER,
                },
                service: {
                  type: Type.NUMBER,
                },
                rounding: {
                  type: Type.NUMBER,
                },
                others: {
                  type: Type.NUMBER,
                },
                grand_total: {
                  type: Type.NUMBER,
                },
              },
            },
            store_detail: {
              type: Type.OBJECT,
              properties: {
                name: {
                  type: Type.STRING,
                },
                address: {
                  type: Type.STRING,
                },
              },
            },
            created_date: {
              type: Type.STRING,
            },
          },
        },
      },
    });
    return response(res, JSON.parse(result.candidates[0].content.parts[0].text));
  } catch (err) {
    return apiError(
      res,
      err.code || status.BAD_REQUEST,
      err.message || "Something went wrong"
    );
  }
};

const getOne = async (req, res) => {
  try {
    const bills = await Bill.findOne({
      where: { bill_id: req.id, is_deleted: 0 },
      include: [
        {
          model: BillShare,
          as: "participants",
          include: [
            {
              model: User,
              attributes: ["name", "email"],
            },
            {
              model: Item,
              as: "items",
              attributes: ["name", "quantity"],
            },
          ],
        },
      ],
    });
    const formatted = {
      ...bills.toJSON(),
      participants: bills.participants.reduce((acc, bill) => {
        const userId = bill.user_id;
        let userEntry = acc.find((entry) => entry.user_id === userId);

        if (!userEntry) {
          userEntry = {
            user_id: userId,
            name: bill.User.name,
            email: bill.User.email,
            total_due: 0,
            status: bill.status,
            items: [],
          };
          acc.push(userEntry);
        }

        userEntry.total_due += bill.amount;
        userEntry.items.push({
          item_id: bill.item_id,
          name: bill.items.name,
          quantity: bill.items.quantity,
          amount: bill.amount,
        });

        return acc;
      }, []),
    };

    return response(res, formatted);
  } catch (err) {
    console.log({ err });
  }
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

const updatePayment = async (req, res) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      req.body.confirm_payment.forEach(async (cp) => {
        await BillShare.update(
          { status: cp.status },
          {
            where: {
              user_id: cp.user_id,
            },
            transaction: t,
          }
        );
      });
      const foundBillShare = await BillShare.findAll({
        where: { bill_id: req.params.id },
        transaction: t,
      });
      if (foundBillShare.every((bs) => bs.status == "paid")) {
        await Bill.update(
          { status: "paid" },
          { where: { bill_id: req.params.id }, transaction: t }
        );
      }
    });

    return response(res, req.body.confirm_payment);
  } catch (error) {
    console.log({ error });
  }
};

module.exports = {
  getAll,
  create,
  getOne,
  deleteOne,
  updateOne,
  updatePayment,
  scan,
};
