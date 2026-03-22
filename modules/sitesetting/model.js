"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const siteSetting = sequelize.define(
  "siteSetting",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    settingKey: {
      type: DataTypes.STRING,
      allowNull: false
    },
    settingValue: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    settingType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    paranoid: true
  }
);

siteSetting.sync({ alter: true });
module.exports = siteSetting;

