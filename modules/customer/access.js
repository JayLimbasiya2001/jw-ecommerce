"use strict";

const { authMiddleware } = require("../../middleware/auth");
const { requireCustomer } = require("../../middleware/requireCustomer");
const { requireStaff } = require("../../middleware/requireStaff");
const { refreshStaffModules } = require("../../middleware/refreshStaffModules");
const { requireModule } = require("../../middleware/requireModule");

/** Customer may only act on own id; staff needs customers module. */
function customerSelfOrStaffCustomers(req, res, next) {
  return authMiddleware(req, res, () => {
    if (req.user.accountType === "customer") {
      if (String(req.params.id) !== String(req.user.id)) {
        return res.status(403).json({
          status: 403,
          message: "You can only access your own account",
        });
      }
      return next();
    }
    if (req.user.accountType === "staff") {
      return requireStaff(req, res, () =>
        refreshStaffModules(req, res, () =>
          requireModule("customers")(req, res, next)
        )
      );
    }
    return res.status(403).json({ status: 403, message: "Access denied" });
  });
}

function bindSelfCustomerId(req, res, next) {
  req.params.id = String(req.user.id);
  next();
}

const customerSelfOnly = [authMiddleware, requireCustomer, bindSelfCustomerId];

module.exports = {
  customerSelfOrStaffCustomers,
  customerSelfOnly,
  bindSelfCustomerId,
};
