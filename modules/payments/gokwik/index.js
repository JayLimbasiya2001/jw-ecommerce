"use strict";

const express = require("express");
const { authMiddleware } = require("../../../middleware/auth");
const { requireCustomer } = require("../../../middleware/requireCustomer");
const controller = require("./controller");

const router = express.Router();

router.get("/config", controller.getConfig);
router.get("/webhook", controller.webhookHealth);
router.post("/webhook", express.json(), controller.webhook);
router.head("/webhook", (req, res) => res.sendStatus(200));
router.post(
  "/success/:orderId",
  authMiddleware,
  requireCustomer,
  controller.paymentSuccess
);

module.exports = router;
