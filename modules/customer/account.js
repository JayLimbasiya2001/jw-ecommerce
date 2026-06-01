"use strict";

const bcrypt = require("bcryptjs");
const { UserService } = require("../user/service");
const { CustomerService } = require("./service");

/**
 * Shared create for POST /api/customers (public register + admin add).
 * @param {object} body
 * @param {{ createdByAdmin?: boolean }} options
 */
async function createCustomerAccount(body, { createdByAdmin = false } = {}) {
  const email = String(body.email || "").trim().toLowerCase();
  const password = body.password;
  const name = String(body.name || "").trim();
  const phone = body.phone != null ? String(body.phone).trim() : null;

  if (!email || !password || !name) {
    const err = new Error("email, password, and name are required");
    err.statusCode = 400;
    throw err;
  }

  const existingStaff = await UserService.findOne({ where: { email } });
  if (existingStaff) {
    const err = new Error("Email already registered");
    err.statusCode = 409;
    throw err;
  }

  const existingCustomer = await CustomerService.findByEmail(email);
  if (existingCustomer) {
    const err = new Error("Email already registered");
    err.statusCode = 409;
    throw err;
  }

  let isVerified = false;
  if (createdByAdmin) {
    if (body.isVerified === true || body.isVerified === "true" || body.isVerified === 1) {
      isVerified = true;
    } else if (body.isVerified === false || body.isVerified === "false" || body.isVerified === 0) {
      isVerified = false;
    } else {
      isVerified = true;
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const payload = {
    email,
    password: passwordHash,
    name,
    phone: phone || null,
    isVerified,
  };

  if (body.profileImage != null && String(body.profileImage).trim() !== "") {
    payload.profileImage = String(body.profileImage).trim();
  }

  const customer = await CustomerService.create(payload);
  return CustomerService.stripPassword(customer);
}

module.exports = { createCustomerAccount };
