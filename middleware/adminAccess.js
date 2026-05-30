"use strict";

const { authMiddleware } = require("./auth");
const { requireStaff } = require("./requireStaff");
const { refreshStaffModules } = require("./refreshStaffModules");
const { requireModule } = require("./requireModule");
const { requireRole } = require("./requireRole");

/** Staff auth + module permission (super admin bypasses module check). */
function adminModule(moduleKey) {
  return [authMiddleware, requireStaff, refreshStaffModules, requireModule(moduleKey)];
}

/** Staff auth + super admin only (e.g. assign admin permissions). */
function superAdminOnly() {
  return [authMiddleware, requireStaff, refreshStaffModules, requireRole(["superAdmin"])];
}

module.exports = { adminModule, superAdminOnly };
