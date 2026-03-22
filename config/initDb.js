"use strict";

/**
 * If DATABASE_URL is set (e.g. Neon), the database already exists — skip CREATE DATABASE.
 * Otherwise creates a local PostgreSQL database if missing.
 */

// --- Previous version (always ran local CREATE DATABASE check) — kept for reference ---
// async function ensureDatabase() {
//   const { Client } = require("pg");
//   const dbName = process.env.DB_NAME || "jewelry_db";
//   const host = process.env.DB_HOST || "localhost";
//   const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;
//   const user = process.env.DB_USER || "postgres";
//   const client = new Client({
//     host,
//     port,
//     user,
//     password: process.env.DB_PASS || "admin",
//     database: "postgres",
//   });
//   try {
//     await client.connect();
//     const res = await client.query(
//       "SELECT 1 FROM pg_database WHERE datname = $1",
//       [dbName]
//     );
//     if (res.rows.length === 0) {
//       await client.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
//       console.log(`Database "${dbName}" created.`);
//     }
//   } catch (err) {
//     const msg =
//       err?.message ||
//       err?.code ||
//       (typeof err === "string" ? err : JSON.stringify(err));
//     throw new Error(
//       `PostgreSQL at ${host}:${port} (user: ${user}): ${msg || "connection failed"}`
//     );
//   } finally {
//     await client.end().catch(() => {});
//   }
// }
// ---------------------------------------------------------------------------------------

async function ensureDatabase() {
  if (process.env.DATABASE_URL) {
    console.log("Using DATABASE_URL (Neon/cloud): skipping local CREATE DATABASE.");
    return;
  }

  const { Client } = require("pg");
  const dbName = process.env.DB_NAME || "jewelry_db";
  const host = process.env.DB_HOST || "localhost";
  const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;
  const user = process.env.DB_USER || "postgres";
  const client = new Client({
    host,
    port,
    user,
    password: process.env.DB_PASS || "admin",
    database: "postgres",
  });

  try {
    await client.connect();
    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );
    if (res.rows.length === 0) {
      await client.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
      console.log(`Database "${dbName}" created.`);
    }
  } catch (err) {
    const msg =
      err?.message ||
      err?.code ||
      (typeof err === "string" ? err : JSON.stringify(err));
    throw new Error(
      `PostgreSQL at ${host}:${port} (user: ${user}): ${msg || "connection failed"}`
    );
  } finally {
    await client.end().catch(() => {});
  }
}

module.exports = { ensureDatabase };
