"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const paymentGateway = sequelize.define(
  "paymentGateway",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    gatewayName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    apiKey: {
      type: DataTypes.STRING,
      allowNull: true
    },
    apiSecret: {
      type: DataTypes.STRING,
      allowNull: true
    },
    webhookSecret: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isTestMode: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    configuration: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false
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

paymentGateway.sync({ alter: true });
module.exports = paymentGateway;

