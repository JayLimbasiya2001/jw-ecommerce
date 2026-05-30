"use strict";

const { isValidModuleKey } = require("../config/adminModules");
const { AdminPermissionService } = require("../modules/adminpermission/service");

/**
 * Super admin: all modules. Admin: checked against DB (not stale JWT).
 * @param {string} moduleKey
 */
function requireModule(moduleKey) {
  const key = String(moduleKey || "").trim();
  if (!isValidModuleKey(key)) {
    throw new Error(`Invalid admin module key: ${moduleKey}`);
  }

  return async (req, res, next) => {
    if (!req.user || req.user.accountType !== "staff") {
      return res.status(401).json({
        status: "fail",
        message: "Authentication required",
      });
    }

    const role = String(req.user.role || "").toLowerCase();
    if (role === "superadmin") return next();

    if (role !== "admin") {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action",
      });
    }

    try {
      const allowed = await AdminPermissionService.hasModule(
        req.user.id,
        req.user.role,
        key
      );
      if (!allowed) {
        return res.status(403).json({
          status: "fail",
          message: `You do not have access to the "${key}" module`,
          moduleKey: key,
        });
      }

      req.user.modules = await AdminPermissionService.getModuleKeysForUser(
        req.user.id,
        req.user.role
      );
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { requireModule };
