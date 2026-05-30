"use strict";

const { AdminPermissionService } = require("../modules/adminpermission/service");

/** Attach latest module keys from DB to req.user (staff only). */
async function refreshStaffModules(req, res, next) {
  if (!req.user || req.user.accountType !== "staff") {
    return next();
  }
  try {
    req.user.modules = await AdminPermissionService.getModuleKeysForUser(
      req.user.id,
      req.user.role
    );
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { refreshStaffModules };
