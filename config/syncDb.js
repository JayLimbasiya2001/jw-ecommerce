"use strict";

const sequelize = require("./db");
const { loadModels } = require("./loadModels");

async function syncDatabase() {
  const alter = process.env.DB_SYNC_ALTER !== "false";
  await sequelize.authenticate();
  console.log("Database connection established.");
  loadModels();
  await sequelize.sync({ alter });
  console.log(`Database models synced (alter: ${alter}).`);
}

module.exports = { syncDatabase };
