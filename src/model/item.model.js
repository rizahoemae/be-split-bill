const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Bill = require("./bill.model");
const Item = sequelize.define(
  "Item",
  {
    item_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    bill_id: {
      type: DataTypes.STRING,
    },
    bill_share_id: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nominal_split_method: {
      type: DataTypes.ENUM("custom", "equal"),
      allowNull: false,
      defaultValue: "equal",
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "items",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["bill_id"],
        name: "bill_id_index",
      },
      {
        fields: ["created_by"],
        name: "created_by_index",
      },
    ],
  }
);

// Item.belongsTo(Bill, {
//   foreignKey: "bill_id",
// });
module.exports = Item;
