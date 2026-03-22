
"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");


const product = require("../product/model")

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

product.hasMany(productvariant,{foreignKey: {allowNull: false}} );
productvariant.belongsTo(product)
        
productvariant.sync({ alter: true });
module.exports = productvariant;
