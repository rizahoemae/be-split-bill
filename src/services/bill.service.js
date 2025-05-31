const Bill = require("../model/bill.model");
const { status } = require("http-status");
const { v4: uuidv4 } = require("uuid");
const redis = require("../config/redis");
const Item = require("../model/item.model");
// const Participant = require("../model/participant.model");
const BillShare = require("../model/bill-share.model");
const sequelize = require("../config/db");
const User = require("../model/user.model");
const { GoogleGenAI, Type } = require("@google/genai");
const { create: createFile } = require("./storage.service");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const getAll = async () => {
  try {
    const bills = await Bill.findAll({ where: { is_deleted: 0 } });
    return bills;
  } catch (err) {
    if (err.code == 404) {
      const error = new Error("No bills found");
      error.statusCode = status.NOT_FOUND;
      throw error;
    }
    throw err;
  }
};

const create = async (form) => {
  const payload = {
    ...form,
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

      return bills;
    });
    return result;
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
    throw err;
  }
};

const scan = async (url) => {
  try {
    const imageFetch = await fetch(url);
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
        {
          text: "Extract information from this image. Format every date you found to 'YYYY-MM-DD' format.",
        },
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
    return JSON.parse(result.candidates[0].content.parts[0].text);
  } catch (err) {
    throw err;
  }
};

const uploadScan = async (file) => {
  try {
    const uploadedFiles = await createFile(file);
    if (uploadedFiles.length > 0) {
      const result = await scan(uploadedFiles[0].url);
      return result;
    }
  } catch (err) {
    throw err;
  }
};

const getOne = async (id) => {
  try {
    const bills = await Bill.findOne({
      where: { bill_id: id, is_deleted: 0 },
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
    return formatted;
  } catch (err) {
    throw err;
  }
};

const findOne = async (id) => {
  try {
    const bills = await Bill.findOne({
      where: { bill_id: id, is_deleted: 0 },
    });
    if (!bills) {
      const error = new Error("No bill found");
      error.statusCode = status.NOT_FOUND;
      throw error;
    }
    return bills;
  } catch (err) {
    if (err.code == 404) {
      err.message = "No bill found";
    }
    throw err;
  }
};

const updateOne = async (id, data) => {
  try {
    const bills = await findOne(id);
    const update = await bills.update(data, { where: { bill_id: id } });
    return update;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const deleteOne = async (id) => {
  const bill = await updateOne(id, { is_deleted: 1 });
  if (!bill) {
    const error = new Error("No bill found");
    error.statusCode = status.NOT_FOUND;
    throw error;
  }
  try {
    const result = await sequelize.transaction(async (t) => {
      await Item.update(
        { is_deleted: 1 },
        { where: { bill_id: id } },
        { transaction: t }
      );
      const update = bill.update(
        { is_deleted: 1 },
        { where: { bill_id: id } },
        { transaction: t }
      );
      return update;
    });
    return "Bill deleted successfully";
  } catch (err) {
    throw err;
  }
};

const updatePayment = async (id, payment) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      payment.forEach(async (cp) => {
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
        where: { bill_id: id },
        transaction: t,
      });
      if (foundBillShare.every((bs) => bs.status == "paid")) {
        await Bill.update(
          { status: "paid" },
          { where: { bill_id: id }, transaction: t }
        );
      }
    });
    return payment;
  } catch (error) {
    throw error;
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
  uploadScan,
};
