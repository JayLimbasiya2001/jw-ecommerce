
"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");


const customer = require("../customer/model");

const orders = sequelize.define(
    "orders",
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        customerId: {
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

customer.hasMany(orders, { foreignKey: "customerId" });
orders.belongsTo(customer);

module.exports = orders;
