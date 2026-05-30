"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const user = require("../user/model");

const adminpermission = sequelize.define(
  "adminpermission",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    moduleKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    grantedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{ unique: true, fields: ["user_id", "module_key"] }],
  }
);

user.hasMany(adminpermission, { foreignKey: "userId", as: "permissions" });
adminpermission.belongsTo(user, { foreignKey: "userId", as: "user" });

adminpermission.sync({ alter: true });
module.exports = adminpermission;
