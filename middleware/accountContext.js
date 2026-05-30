"use strict";

function getCustomerId(req) {
  if (req.user?.accountType === "customer") return req.user.id;
  return null;
}

module.exports = { getCustomerId };
