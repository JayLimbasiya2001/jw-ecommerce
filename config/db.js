"use strict";

const { Sequelize } = require("sequelize");
require("dotenv").config();

// -----------------------------------------------------------------------------
// Previous code (local PostgreSQL only — kept for reference; not active)
// -----------------------------------------------------------------------------
// const sequelize = new Sequelize(
//   process.env.DB_NAME || "jewelry_db",
//   process.env.DB_USER || "postgres",
//   process.env.DB_PASS || "admin",
//   {
//     host: process.env.DB_HOST || "localhost",
//     port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
//     dialect: "postgres",
//     logging: process.env.DB_LOGGING === "true" ? console.log : false,
//     define: { underscored: true },
//   }
// );
// module.exports = sequelize;
// -----------------------------------------------------------------------------

const logging = process.env.DB_LOGGING === "true" ? console.log : false;
const define = { underscored: true };

/** Neon / cloud Postgres: use full URL + SSL */
const databaseUrl = process.env.DATABASE_URL;

let sequelize;

if (databaseUrl) {
  sequelize = new Sequelize(databaseUrl, {
    dialect: "postgres",
    logging,
    define,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || "jewelry_db",
    process.env.DB_USER || "postgres",
    process.env.DB_PASS || "admin",
    {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
      dialect: "postgres",
      logging,
      define,
    }
  );
}

module.exports = sequelize;
