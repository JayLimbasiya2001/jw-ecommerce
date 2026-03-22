"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const newsletterSubscriber = sequelize.define(
  "newsletterSubscriber",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    subscribed_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    unsubscribed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    paranoid: true
  }
);

newsletterSubscriber.sync({ alter: true });
module.exports = newsletterSubscriber;

