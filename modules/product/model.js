
"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");


const category = require("../category/model")
const brand = require("../brand/model")

const product = sequelize.define(
    "product",
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        brandId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        sku: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        basePrice: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        salePrice: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        metalType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        stoneType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        weight: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        isTrending: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        isNewArrival: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        isBestSeller: {
            type: DataTypes.BOOLEAN,
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

category.hasMany(product,{foreignKey: {allowNull: false}} );
product.belongsTo(category)
        
brand.hasMany(product,{foreignKey: {allowNull: false}} );
product.belongsTo(brand)
        
product.sync({ alter: true });
module.exports = product;
