"use strict";

const jwt = require("jsonwebtoken");
const { AdminPermissionService } = require("../modules/adminpermission/service");
const { allModuleKeys } = require("../config/adminModules");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES = "7d";

async function signStaffToken(userRow) {
  const role = userRow.role;
  const modules =
    String(role).toLowerCase() === "superadmin"
      ? allModuleKeys()
      : await AdminPermissionService.getModuleKeysForUser(userRow.id, role);

  return jwt.sign(
    {
      id: userRow.id,
      email: userRow.email,
      role,
      accountType: "staff",
      modules,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

function signCustomerToken(customerRow) {
  return jwt.sign(
    {
      id: customerRow.id,
      email: customerRow.email,
      accountType: "customer",
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

module.exports = { signStaffToken, signCustomerToken, JWT_SECRET };
