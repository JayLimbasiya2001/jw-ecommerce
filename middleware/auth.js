"use strict";

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      status: "fail",
      message: "Authorization token missing"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    if (!decoded.accountType) {
      const role = String(decoded.role || "").toLowerCase();
      if (role === "admin" || role === "superadmin") {
        decoded.accountType = "staff";
      } else if (role === "customer") {
        decoded.accountType = "customer";
      }
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      status: 401,
      message: "Invalid or expired token"
    });
  }
};

module.exports = { authMiddleware };

