"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const customer = require("../customer/model");
const product = require("../product/model");
const productVariant = require("../productvariant/model");

const cart = sequelize.define(
  "cart",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    variantId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
  }
);

customer.hasMany(cart, { foreignKey: { allowNull: false } });
cart.belongsTo(customer);

product.hasMany(cart, { foreignKey: { allowNull: false } });
cart.belongsTo(product);

productVariant.hasMany(cart, { foreignKey: "variantId" });
cart.belongsTo(productVariant, { foreignKey: "variantId", as: "variant" });

module.exports = cart;

