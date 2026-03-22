
"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");



const instagramreels = sequelize.define(
    "instagramreels",
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        thumbnail: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        video: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        caption: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        likes: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        views: {
            type: DataTypes.INTEGER,
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

instagramreels.sync({ alter: true });
module.exports = instagramreels;
