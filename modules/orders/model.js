
"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");


const user = require("../user/model")

const orders = sequelize.define(
    "orders",
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
        orderStatus: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        paymentStatus: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        paymentMethod: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        transactionId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        subTotal: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        taxAmount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        shhipingCost: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        discountAmount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        totalAmount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        shhipingAddress: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        billingAddress: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
        }
    },
    {
        paranoid: true,
    }
);

user.hasMany(orders, { foreignKey: "userId" });
orders.belongsTo(user);

orders.sync({ alter: true });
module.exports = orders;
