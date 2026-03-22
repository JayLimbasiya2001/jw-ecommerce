
"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");


const user = require("../user/model")

const address = sequelize.define(
    "address",
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
        address_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address_line1: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address_line2: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        postalCode: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        country: {
            type: DataTypes.STRING,
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

user.hasMany(address,{foreignKey: {allowNull: false}} );
address.belongsTo(user)
        
address.sync({ alter: true });
module.exports = address;
