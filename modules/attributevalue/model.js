"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const attribute = require("../attribute/model");

const attributeValue = sequelize.define(
  "attributeValue",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    attributeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    indexes: [
      {
        unique: true,
        fields: ["attribute_id", "value"],
        name: "uniq_attribute_value_scope",
      },
    ],
  }
);

attribute.hasMany(attributeValue, { foreignKey: "attributeId", as: "values" });
attributeValue.belongsTo(attribute, { foreignKey: "attributeId", as: "attribute" });

const attributeTablesReady = attribute
  .sync({ alter: true })
  .then(() => attributeValue.sync({ alter: true }))
  .catch((err) => {
    console.error("attribute / attributeValue sync failed:", err?.message || err);
    return Promise.reject(err);
  });

attributeValue.attributeTablesReady = attributeTablesReady;

module.exports = attributeValue;
