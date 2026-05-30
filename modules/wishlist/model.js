
"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");


const customer = require("../customer/model");
const product = require("../product/model")

const wishlist = sequelize.define(
    "wishlist",
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
        productId: {
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

customer.hasMany(wishlist, { foreignKey: { allowNull: false } });
wishlist.belongsTo(customer);
        
product.hasMany(wishlist,{foreignKey: {allowNull: false}} );
wishlist.belongsTo(product);

wishlist.sync({ alter: true });
module.exports = wishlist;
