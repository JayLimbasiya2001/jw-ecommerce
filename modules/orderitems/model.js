
"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");


const product = require("../product/model")
const orders = require("../orders/model")
const productvariant = require("../productvariant/model")

const orderitems = sequelize.define(
    "orderitems",
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        variantId: {
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
        },
        qty: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        unitPrice: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        totalPrice: {
            type: DataTypes.INTEGER,
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

orders.hasMany(orderitems, { foreignKey: "orderId" });
orderitems.belongsTo(orders, { foreignKey: "orderId" });

product.hasMany(orderitems, { foreignKey: "productId" });
orderitems.belongsTo(product, { foreignKey: "productId" });

productvariant.hasMany(orderitems, { foreignKey: "variantId" });
orderitems.belongsTo(productvariant, { foreignKey: "variantId" });

orderitems.sync({ alter: true });
module.exports = orderitems;
