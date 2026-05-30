"use strict";

require("dotenv").config();

const { ensureDatabase } = require("./config/initDb");
const { syncDatabase } = require("./config/syncDb");
const { seedSuperAdminIfNeeded } = require("./config/seedSuperAdmin");

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await ensureDatabase();
    await syncDatabase();
    await seedSuperAdminIfNeeded();
  } catch (err) {
    console.error("Database init failed:", err?.message || err?.code || err);
    if (process.env.NODE_ENV !== "production") {
      console.error(err);
    }
    process.exit(1);
  }

  const app = require("./app");
  app.listen(PORT, () => {
    console.log(`Jewelry E-Commerce API listening on port ${PORT}`);
  });
}

start();
