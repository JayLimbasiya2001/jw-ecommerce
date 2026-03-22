"use strict";

/**
 * Restricts access to users whose role is in the allowed list.
 * Use after authMiddleware so req.user exists.
 * @param {string[]} allowedRoles - e.g. ['superAdmin', 'admin']
 */
function requireRole(allowedRoles) {
  const set = new Set(allowedRoles.map((r) => String(r).toLowerCase()));
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "fail",
        message: "Authentication required",
      });
    }
    const role = (req.user.role || "").toLowerCase();
    if (!set.has(role)) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
}

module.exports = { requireRole };
