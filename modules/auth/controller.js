"use strict";

const bcrypt = require("bcryptjs");
const { UserService } = require("../user/service");
const { CustomerService } = require("../customer/service");
const { signStaffToken, signCustomerToken } = require("../../middleware/authTokens");

const STAFF_ROLES = new Set(["admin", "superadmin"]);

function stripStaffPassword(user) {
  const plain = user.get ? user.get({ plain: true }) : { ...user };
  delete plain.password;
  return plain;
}

exports.registerCustomer = async (req, res, next) => {
  try {
    const { email, password, name, phone } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();

    const existingStaff = await UserService.findOne({
      where: { email: normalizedEmail },
    });
    if (existingStaff) {
      return res.status(409).json({
        status: "fail",
        message: "Email already registered",
      });
    }

    const existingCustomer = await CustomerService.findByEmail(normalizedEmail);
    if (existingCustomer) {
      return res.status(409).json({
        status: "fail",
        message: "Email already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const customer = await CustomerService.create({
      email: normalizedEmail,
      password: passwordHash,
      name,
      phone,
      isVerified: false,
    });

    const token = signCustomerToken(customer);
    const profile = CustomerService.stripPassword(customer);

    res.status(201).json({
      status: "success",
      message: "Customer registered successfully",
      data: {
        token,
        accountType: "customer",
        customer: profile,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.loginCustomer = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();

    const customer = await CustomerService.findByEmail(normalizedEmail);
    if (!customer) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid credentials",
      });
    }

    const valid = await bcrypt.compare(password, customer.password);
    if (!valid) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid credentials",
      });
    }

    const token = signCustomerToken(customer);
    const profile = CustomerService.stripPassword(customer);

    res.status(200).json({
      status: "success",
      message: "Customer login successful",
      data: {
        token,
        accountType: "customer",
        customer: profile,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await UserService.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid credentials",
      });
    }

    const role = String(user.role || "").toLowerCase();
    if (!STAFF_ROLES.has(role)) {
      return res.status(403).json({
        status: "fail",
        message: "This account cannot access the admin dashboard",
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid credentials",
      });
    }

    const token = await signStaffToken(user);
    const profile = stripStaffPassword(user);
    const modules =
      role === "superadmin"
        ? require("../../config/adminModules").allModuleKeys()
        : await require("../adminpermission/service").AdminPermissionService.getModuleKeysForUser(
            user.id,
            user.role
          );

    res.status(200).json({
      status: "success",
      message: "Admin login successful",
      data: {
        token,
        accountType: "staff",
        user: { ...profile, modules },
      },
    });
  } catch (err) {
    next(err);
  }
};

/** Current session (customer or staff). */
exports.me = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "fail", message: "Not authenticated" });
    }

    if (req.user.accountType === "customer") {
      const customer = await CustomerService.findByIdPlain(req.user.id);
      if (!customer) {
        return res.status(404).json({ status: "fail", message: "Customer not found" });
      }
      return res.status(200).json({
        status: "success",
        data: { accountType: "customer", customer },
      });
    }

    if (req.user.accountType === "staff") {
      const user = await UserService.findOne({ where: { id: req.user.id } });
      if (!user) {
        return res.status(404).json({ status: "fail", message: "Staff user not found" });
      }
      const profile = stripStaffPassword(user);
      const { AdminPermissionService } = require("../adminpermission/service");
      const modules = await AdminPermissionService.getModuleKeysForUser(
        user.id,
        user.role
      );
      return res.status(200).json({
        status: "success",
        data: {
          accountType: "staff",
          user: {
            ...profile,
            modules,
          },
        },
      });
    }

    return res.status(401).json({ status: "fail", message: "Invalid session" });
  } catch (err) {
    next(err);
  }
};

/** @deprecated Use registerCustomer */
exports.register = exports.registerCustomer;

/** @deprecated Use loginCustomer or loginAdmin */
exports.login = async (req, res, next) => {
  return res.status(400).json({
    status: "fail",
    message:
      "Use POST /api/auth/customer/login or POST /api/auth/admin/login instead of /api/auth/login",
  });
};
