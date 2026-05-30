"use strict";

/**
 * Optional: set SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, SUPER_ADMIN_NAME in .env
 * to create the first super admin on server start (staff users table only).
 */
async function seedSuperAdminIfNeeded() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  if (!email || !password) return;

  const bcrypt = require("bcryptjs");
  const { UserService } = require("../modules/user/service");

  const existing = await UserService.findOne({
    where: { email: String(email).trim().toLowerCase() },
  });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await UserService.create({
    email: String(email).trim().toLowerCase(),
    password: passwordHash,
    name: process.env.SUPER_ADMIN_NAME || "Super Admin",
    phone: process.env.SUPER_ADMIN_PHONE || null,
    role: "superAdmin",
    isVerified: true,
  });
  console.log(`Super admin seeded: ${email}`);
}

module.exports = { seedSuperAdminIfNeeded };
