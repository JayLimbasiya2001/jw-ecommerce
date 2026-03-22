
"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");



const heroslider = sequelize.define(
    "heroslider",
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        subTitle: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        mobileImage: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        buttonText: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        buttonLink: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        rank: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATE,
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
        }
    },
    {
        paranoid: true,
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

heroslider.sync({ alter: true });
module.exports = heroslider;
