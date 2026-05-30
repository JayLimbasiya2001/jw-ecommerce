
"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");


const orders = require("../orders/model")
const customer = require("../customer/model");
const product = require("../product/model")

const reviews = sequelize.define(
    "reviews",
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
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        isVerifiedPurchase: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        isApproved: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
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

customer.hasMany(reviews, { foreignKey: "customerId" });
reviews.belongsTo(customer, { foreignKey: "customerId" });

product.hasMany(reviews, { foreignKey: "productId" });
reviews.belongsTo(product, { foreignKey: "productId" });

orders.hasMany(reviews, { foreignKey: "orderId" });
reviews.belongsTo(orders, { foreignKey: "orderId" });

reviews.sync({ alter: true });
module.exports = reviews;
