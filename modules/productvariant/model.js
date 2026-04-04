
"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const product = require("../product/model");

/**
 * One row = one sellable SKU (inventory, price, images).
 * Color/size matrix (e.g. Red→4,5,6 and Yellow→4,5 only) is modeled as multiple rows
 * sharing the same productId with different `color` + `size`; see `variantsByColor` on product GET.
 */
const productvariant = sequelize.define(
  "productvariant",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    size: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
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

product.hasMany(productvariant, {
  foreignKey: { allowNull: false },
  as: "variants",
});
productvariant.belongsTo(product);

productvariant.sync({ alter: true });
module.exports = productvariant;
