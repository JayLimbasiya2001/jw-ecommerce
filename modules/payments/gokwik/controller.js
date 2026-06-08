"use strict";

const crypto = require("crypto");
const { getGokwikConfig } = require("../../../config/gokwik");
const {
  mapGokwikPaymentStatus,
  mapGokwikOrderStatus,
} = require("../../../services/gokwik/orderPayload");
const { finalizePaidOrder, cancelPendingGokwikOrder } = require("../../../services/gokwik/finalizeOrder");
const { OrdersService } = require("../../orders/service");
const { orderIncludeOptions, formatOrder } = require("../../orders/ordersLogic");

function verifyWebhook(req) {
  const config = getGokwikConfig();
  if (
    process.env.GOKWIK_WEBHOOK_SKIP_VERIFY === "true" &&
    config.env !== "PRODUCTION"
  ) {
    return true;
  }
  if (!config.webhookSecret) {
    if (config.env !== "PRODUCTION" && config.mockCheckout) return true;
    return false;
  }

  const signature =
    req.headers["x-gokwik-signature"] ||
    req.headers["x-webhook-signature"] ||
    req.headers["gk-signature"];

  if (signature) {
    const expected = crypto
      .createHmac("sha256", config.webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");
    return signature === expected || signature === `sha256=${expected}`;
  }

  const headerSecret = req.headers["gk-webhook-secret"] || req.headers["x-gokwik-secret"];
  return headerSecret === config.webhookSecret;
}

exports.getConfig = (req, res) => {
  const config = getGokwikConfig();
  return res.status(200).json({
    status: 200,
    data: {
      enabled: config.enabled,
      environment: config.env,
      isProduction: config.isProduction,
      merchantId: config.merchantId,
      scriptUrl: config.scriptUrl,
      mockCheckout: config.mockCheckout,
    },
  });
};

/** Dashboard / GoKwik may GET the URL to verify it is reachable before saving. */
exports.webhookHealth = (req, res) => {
  return res.status(200).json({
    status: 200,
    message: "GoKwik webhook endpoint is active",
    path: "/api/payments/gokwik/webhook",
  });
};

/** GoKwik server → merchant payment notification */
exports.webhook = async (req, res, next) => {
  try {
    const body = req.body || {};

    // URL verification ping from GoKwik dashboard (no order payload yet)
    if (
      body.challenge ||
      body.verification_token ||
      body.type === "verification" ||
      body.event === "verification"
    ) {
      return res.status(200).json({
        status: 200,
        challenge: body.challenge,
        verification_token: body.verification_token,
        message: "Webhook verified",
      });
    }

    const merchantOrderId =
      body.merchant_order_id ||
      body.merchantOrderId ||
      body.order_id ||
      body.orderId;

    // Empty or probe POST during dashboard save — accept if URL is reachable
    if (!merchantOrderId) {
      if (req.method === "GET" || Object.keys(body).length === 0) {
        return res.status(200).json({ status: 200, message: "Webhook ready" });
      }
    }

    if (!verifyWebhook(req)) {
      const config = getGokwikConfig();
      if (config.env !== "PRODUCTION" && config.mockCheckout) {
        // Allow sandbox probes without signature
      } else {
        return res.status(401).json({ status: 401, message: "Invalid webhook signature" });
      }
    }

    if (!merchantOrderId) {
      return res.status(400).json({ status: 400, message: "merchant_order_id is required" });
    }

    const orderId = parseInt(merchantOrderId, 10);
    const paymentStatus = mapGokwikPaymentStatus(body);
    const transactionId =
      body.transaction_id ||
      body.payment_id ||
      body.gokwik_order_id ||
      body.reference_id ||
      "";

    if (paymentStatus === "paid") {
      await finalizePaidOrder(orderId, {
        transactionId: String(transactionId),
        paymentMethod: body.payment_method || "gokwik",
      });
    } else if (paymentStatus === "failed") {
      await cancelPendingGokwikOrder(orderId);
    } else {
      await OrdersService.update(
        {
          paymentStatus,
          orderStatus: mapGokwikOrderStatus(paymentStatus),
          transactionId: transactionId ? String(transactionId) : undefined,
        },
        { where: { id: orderId } }
      );
    }

    return res.status(200).json({ status: 200, message: "Webhook processed" });
  } catch (err) {
    next(err);
  }
};

/** Client callback after SDK success (optional, customer token) */
exports.paymentSuccess = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.orderId, 10);
    const order = await OrdersService.findOne({
      where: { id: orderId, customerId: req.user.id },
    });
    if (!order) {
      return res.status(404).json({ status: 404, message: "Order not found" });
    }

    const config = getGokwikConfig();
    if (config.mockCheckout && order.paymentStatus === "pending") {
      await finalizePaidOrder(orderId, {
        transactionId: req.body?.transactionId || `mock_tx_${Date.now()}`,
        paymentMethod: "gokwik",
      });
    }

    const updated = await OrdersService.findOne({
      where: { id: orderId },
      include: orderIncludeOptions(),
    });

    return res.status(200).json({
      status: 200,
      message: "Payment status updated",
      data: formatOrder(updated),
    });
  } catch (err) {
    next(err);
  }
};
