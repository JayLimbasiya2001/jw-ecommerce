"use strict";

const { requireStaff } = require("./requireStaff");
const { refreshStaffModules } = require("./refreshStaffModules");
const { requireModule } = require("./requireModule");

/**
 * Storefront customers OR staff with a given module (e.g. orders).
 */
function allowCustomerOrStaffModule(moduleKey) {
  const checkModule = requireModule(moduleKey);
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "fail",
        message: "Authentication required",
      });
    }
    if (req.user.accountType === "customer") return next();
    if (req.user.accountType === "staff") {
      return requireStaff(req, res, () =>
        refreshStaffModules(req, res, () => checkModule(req, res, next))
      );
    }
    return res.status(403).json({
      status: "fail",
      message: "Access denied",
    });
  };
}

module.exports = { allowCustomerOrStaffModule };
