"use strict";

const bcrypt = require("bcryptjs");
const { UserService } = require("../user/service");
const { CustomerService } = require("./service");
const { createCustomerAccount } = require("./account");
const { parseCustomerListQuery } = require("./listQuery");
const { buildPaginatedResponse } = require("../../middleware/listPagination");
const { signCustomerToken } = require("../../middleware/authTokens");

function coerceBool(val) {
  if (val === true || val === "true" || val === 1 || val === "1") return true;
  if (val === false || val === "false" || val === 0 || val === "0") return false;
  return undefined;
}

function buildUpdatePayload(body, { isStaff = false } = {}) {
  const payload = {};
  if (body.email !== undefined) payload.email = String(body.email).trim().toLowerCase();
  if (body.name !== undefined) payload.name = String(body.name).trim();
  if (body.phone !== undefined) payload.phone = String(body.phone ?? "").trim() || null;
  if (body.profileImage !== undefined && String(body.profileImage).trim() !== "") {
    payload.profileImage = String(body.profileImage).trim();
  }
  if (isStaff) {
    const isVerified = coerceBool(body.isVerified);
    if (isVerified !== undefined) payload.isVerified = isVerified;
  }
  if (body.password !== undefined && String(body.password).length >= 6) {
    payload.password = body.password;
  }
  return payload;
}

async function assertEmailAvailable(email, customerId) {
  if (!email) return;
  const existingStaff = await UserService.findOne({ where: { email } });
  if (existingStaff) {
    const err = new Error("Email already registered");
    err.statusCode = 409;
    throw err;
  }
  const existingCustomer = await CustomerService.findByEmail(email);
  if (existingCustomer && String(existingCustomer.id) !== String(customerId)) {
    const err = new Error("Email already registered");
    err.statusCode = 409;
    throw err;
  }
}

/** POST /api/customers — public register OR admin create (same API). */
exports.create = async (req, res, next) => {
  try {
    const createdByAdmin = req.user?.accountType === "staff";
    const customer = await createCustomerAccount(req.body, { createdByAdmin });

    if (createdByAdmin) {
      return res.status(201).json({
        status: 201,
        message: "Customer created successfully",
        data: { customer },
      });
    }

    const token = signCustomerToken(customer);
    return res.status(201).json({
      status: 201,
      message: "Customer registered successfully",
      data: {
        token,
        customer,
      },
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    if (statusCode !== 500) {
      return res.status(statusCode).json({
        status: statusCode,
        message: err.message,
      });
    }
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { where, order, limit, offset, page } = parseCustomerListQuery(req.query);
    const result = await CustomerService.findAndCountAll({
      where,
      order,
      limit,
      offset,
      attributes: { exclude: ["password"] },
      distinct: true,
    });

    const count =
      typeof result?.count === "number"
        ? result.count
        : Array.isArray(result?.count)
          ? result.count.length
          : 0;
    const rows = (result?.rows ?? []).map((r) => CustomerService.stripPassword(r));

    const body = buildPaginatedResponse(
      { count, rows },
      page,
      limit,
      count === 0 ? "No customers found" : "Customers fetched successfully"
    );
    return res.status(200).json(body);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const data = await CustomerService.findByIdPlain(req.params.id);
    if (!data) {
      return res.status(404).json({ status: 404, message: "Customer not found" });
    }
    return res.status(200).json({ status: 200, data });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const isStaff = req.user?.accountType === "staff";
    const payload = buildUpdatePayload(req.body, { isStaff });
    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ status: 400, message: "No valid fields to update" });
    }
    await assertEmailAvailable(payload.email, id);
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }
    const [affected] = await CustomerService.update(payload, { where: { id } });
    if (!affected) {
      return res.status(404).json({ status: 404, message: "Customer not found" });
    }
    const data = await CustomerService.findByIdPlain(id);
    return res.status(200).json({
      status: 200,
      message: isStaff ? "Customer updated successfully" : "Account updated successfully",
      data,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    if (statusCode !== 500) {
      return res.status(statusCode).json({ status: statusCode, message: err.message });
    }
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const isStaff = req.user?.accountType === "staff";
    const deleted = await CustomerService.remove({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ status: 404, message: "Customer not found" });
    }
    return res.status(200).json({
      status: 200,
      message: isStaff ? "Customer deleted successfully" : "Account deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
