"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

/**
 * Links a SKU (productvariant) to chosen global attribute values.
 * One row per (variant, attribute type); `attributeValueId` implies the type.
 */
const variantAttribute = sequelize.define(
  "variantAttribute",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    variantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    attributeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    attributeValueId: {
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
  },
  {
    paranoid: false,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["variant_id", "attribute_id"],
        name: "uniq_variant_per_attribute_type",
      },
    ],
  }
);

module.exports = variantAttribute;
