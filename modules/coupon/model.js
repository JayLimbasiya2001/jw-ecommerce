"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const coupon = sequelize.define(
  "coupon",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    couponCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    discountType: {
      type: DataTypes.ENUM("percentage", "fixed"),
      allowNull: false
    },
    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    minPurchaseAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    maxDiscountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    usageLimit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    usageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    perUserLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    validFrom: {
      type: DataTypes.DATE,
      allowNull: true
    },
    validUntil: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    paranoid: true
  }
);

coupon.sync({ alter: true });
module.exports = coupon;

