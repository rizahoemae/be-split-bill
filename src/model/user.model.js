const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { apiError } = require("../utils");
const saltRounds = 10;
const accessKey = process.env.ACCESS_KEY;
const refreshKey = process.env.REFRESH_KEY;

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["email"],
        name: "email_index",
      },
    ],
  }
);

User.alreadyExists = async function (email) {
  const user = await User.findOne({ where: { email }, attributes: ["email"] });
  return user;
};

User.generatePassword = async function (password) {
  return bcrypt.hash(password, saltRounds);
};

User.comparePassword = async function (password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
};

User.generateAccessToken = function (payload) {
  return jwt.sign(payload, accessKey, { expiresIn: "1h" });
};

User.generateRefreshToken = function (payload) {
  return jwt.sign(payload, refreshKey, { expiresIn: "7d" });
};

User.compareAccessToken = function (token) {
  try {
    return jwt.verify(token, accessKey);
  } catch (err) {
    return err;
  }
};

User.compareRefreshToken = function (token) {
  return jwt.verify(token, refreshKey);
};

module.exports = User;
