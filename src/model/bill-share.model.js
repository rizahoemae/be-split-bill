const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const BillShare = sequelize.define(
  "BillShare",
  {
    bill_share_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    item_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bill_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("paid", "pending"),
      allowNull: false,
      defaultValue: "pending",
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "bill_share",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["bill_id"],
        name: "bill_id_index",
      },
    ],
  }
);

module.exports = BillShare;
