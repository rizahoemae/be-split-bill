const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Bill = sequelize.define(
  "Bill",
  {
    bill_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tax: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    service: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    discount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    notes: {
      type: DataTypes.STRING,
    },
    split_method: {
      type: DataTypes.ENUM("custom", "equal"),
      allowNull: false,
      defaultValue: "equal",
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
    tableName: "bills",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Bill;
