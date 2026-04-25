"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const product = require("../product/model");

/**
 * One row = one sellable SKU (price, stock, sku, images).
 * Options (color, size, purity, weight, …) are dynamic via `variant_attributes` → `attributes` + `attribute_values`.
 *
 * Sync uses `alter: false` so legacy DBs aren’t mutated by Sequelize; manage column drops/adds via migrations if needed.
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
    sku: {
      type: DataTypes.STRING,
      allowNull: false,
      /** Unique enforced in API; add DB UNIQUE after deduping legacy SKU rows if needed. */
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

const Attribute = require("../attribute/model");
const AttributeValue = require("../attributevalue/model");
const VariantAttribute = require("../variantattribute/model");

productvariant.hasMany(VariantAttribute, {
  foreignKey: "variantId",
  as: "variantAttributes",
  onDelete: "CASCADE",
});
VariantAttribute.belongsTo(productvariant, {
  foreignKey: "variantId",
  onDelete: "CASCADE",
});
VariantAttribute.belongsTo(Attribute, { foreignKey: "attributeId", as: "attribute" });
VariantAttribute.belongsTo(AttributeValue, {
  foreignKey: "attributeValueId",
  as: "attributeValue",
});

if (AttributeValue.attributeTablesReady) {
  AttributeValue.attributeTablesReady
    .then(() => VariantAttribute.sync({ alter: true }))
    .catch((err) => {
      console.error("variantAttribute sync failed:", err?.message || err);
    });
} else {
  VariantAttribute.sync({ alter: true }).catch((err) => {
    console.error("variantAttribute sync failed:", err?.message || err);
  });
}

productvariant.sync({ alter: false });
module.exports = productvariant;
