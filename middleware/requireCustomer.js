"use strict";

/**
 * Staff accounts cannot use customer-only storefront account APIs.
 */
function requireCustomer(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      status: "fail",
      message: "Authentication required",
    });
  }
  if (req.user.accountType !== "customer") {
    return res.status(403).json({
      status: "fail",
      message: "This action is only available for customer accounts",
    });
  }
  next();
}

module.exports = { requireCustomer };
