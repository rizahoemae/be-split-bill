const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Bill = require("./bill.model");
const User = require("./user.model");
const Participant = sequelize.define(
  "Participant",
  {
    participant_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    bill_id: {
      type: DataTypes.STRING,
    },
    user_id: {
      type: DataTypes.STRING,
    },
    total_due: {
      type: DataTypes.INTEGER,
      // allowNull: false,
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
    tableName: "participants",
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

Participant.belongsTo(Bill, {
  foreignKey: "bill_id",
  targetKey: "bill_id",
});

Participant.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "user_id",
});
module.exports = Participant;
