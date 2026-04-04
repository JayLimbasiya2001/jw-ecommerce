
"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const product = require("../product/model");
const productvariant = require("../productvariant/model");

const productimage = sequelize.define(
  "productimage",
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
    /** When set, this image belongs to that variant (e.g. red + size 3). Null = product-level gallery. */
    variantId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    altText: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    rank: {
      type: DataTypes.INTEGER,
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

product.hasMany(productimage, { foreignKey: { allowNull: false } });
productimage.belongsTo(product);

productvariant.hasMany(productimage, {
  foreignKey: "variantId",
  as: "images",
});
productimage.belongsTo(productvariant, {
  foreignKey: "variantId",
  as: "variant",
});

productimage.sync({ alter: true });
module.exports = productimage;
