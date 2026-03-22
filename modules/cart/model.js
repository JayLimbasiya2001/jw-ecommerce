"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const user = require("../user/model");
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
    userId: {
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

user.hasMany(cart, { foreignKey: { allowNull: false } });
cart.belongsTo(user);

product.hasMany(cart, { foreignKey: { allowNull: false } });
cart.belongsTo(product);

productVariant.hasMany(cart, { foreignKey: { allowNull: true } });
cart.belongsTo(productVariant, { foreignKey: "variantId" });

cart.sync({ alter: true });
module.exports = cart;

