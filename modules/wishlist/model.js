
"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");


const user = require("../user/model")
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
        userId: {
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

user.hasMany(wishlist,{foreignKey: {allowNull: false}} );
wishlist.belongsTo(user)
        
product.hasMany(wishlist,{foreignKey: {allowNull: false}} );
wishlist.belongsTo(product);

wishlist.sync({ alter: true });
module.exports = wishlist;
