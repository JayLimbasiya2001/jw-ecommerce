"use strict";

require("dotenv").config();

const app = require("./app");
const { ensureDatabase } = require("./config/initDb");

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await ensureDatabase();
  } catch (err) {
    console.error("Database init failed:", err?.message || err?.code || err);
    if (process.env.NODE_ENV !== "production") {
      console.error(err);
    }
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log(`Jewelry E-Commerce API listening on port ${PORT}`);
  });
}

start();

