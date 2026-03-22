
"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");


const product = require("../product/model")

const productimage = sequelize.define(
    "productimage",
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
        image: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        altText: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isPrimary: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        rank: {
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

product.hasMany(productimage,{foreignKey: {allowNull: false}} );
productimage.belongsTo(product);

productimage.sync({ alter: true });
module.exports = productimage;
