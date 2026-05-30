"use strict";

/**
 * Blocks storefront customers from admin dashboard / staff APIs.
 * Use after authMiddleware.
 */
function requireStaff(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      status: "fail",
      message: "Authentication required",
    });
  }
  if (req.user.accountType !== "staff") {
    return res.status(403).json({
      status: "fail",
      message: "Admin dashboard access is not allowed for customer accounts",
    });
  }
  next();
}

module.exports = { requireStaff };
