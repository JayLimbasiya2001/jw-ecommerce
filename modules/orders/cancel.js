"use strict";

const sequelize = require("../../config/db");
const { OrdersService } = require("./service");
const { OrderitemsService } = require("../orderitems/service");
const Product = require("../product/model");
const ProductVariant = require("../productvariant/model");
const OrderItem = require("../orderitems/model");
const { orderIncludeOptions } = require("./ordersLogic");
const { getGokwikConfig } = require("../../config/gokwik");
const { updateGokwikOrder } = require("../../services/gokwik/client");

const CUSTOMER_CANCELLABLE = new Set(["pending", "confirmed"]);
const STAFF_CANCELLABLE = new Set(["pending", "confirmed", "processing"]);

function httpError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function stockWasReduced(order) {
  if (order.paymentStatus === "paid") return true;
  if (order.paymentMethod === "cod" && order.orderStatus !== "cancelled") return true;
  return false;
}

async function restoreStockForOrder(items, transaction) {
  for (const item of items) {
    if (item.variantId) {
      await ProductVariant.increment("stock", {
        by: item.qty,
        where: { id: item.variantId },
        transaction,
      });
    } else {
      await Product.increment("stock", {
        by: item.qty,
        where: { id: item.productId },
        transaction,
      });
    }
  }
}

async function cancelOrder(orderId, { customerId, isStaff = false, reason } = {}) {
  const order = await OrdersService.findOne({
    where: { id: orderId },
    include: [{ model: OrderItem, as: "items" }],
  });
  if (!order) throw httpError("Order not found", 404);

  const plain = order.get({ plain: true });
  if (!isStaff && plain.customerId !== customerId) {
    throw httpError("You can only cancel your own orders", 403);
  }
  if (plain.orderStatus === "cancelled") {
    return OrdersService.findOne({ where: { id: orderId }, include: orderIncludeOptions() });
  }

  const allowed = isStaff ? STAFF_CANCELLABLE : CUSTOMER_CANCELLABLE;
  if (!allowed.has(plain.orderStatus)) {
    throw httpError(`Order cannot be cancelled in status: ${plain.orderStatus}`, 400);
  }
  if (!isStaff && plain.paymentStatus === "paid" && plain.paymentMethod !== "cod") {
    throw httpError("Paid orders cannot be cancelled online — contact support", 400);
  }

  const transaction = await sequelize.transaction();
  try {
    if (stockWasReduced(plain)) {
      await restoreStockForOrder(plain.items || [], transaction);
    }

    const paymentStatus =
      plain.paymentStatus === "paid" ? "refunded" : plain.paymentStatus === "pending" ? "failed" : plain.paymentStatus;

    await OrdersService.update(
      {
        orderStatus: "cancelled",
        paymentStatus,
        transactionId: reason
          ? `${plain.transactionId}|cancel:${String(reason).slice(0, 80)}`
          : plain.transactionId,
      },
      { where: { id: orderId }, transaction }
    );

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }

  const gokwikConfig = getGokwikConfig();
  if (gokwikConfig.enabled && plain.paymentMethod === "gokwik") {
    try {
      await updateGokwikOrder({
        merchant_order_id: String(orderId),
        order_status: "cancelled",
      });
    } catch (syncErr) {
      console.warn("GoKwik cancel sync failed:", syncErr.message);
    }
  }

  return OrdersService.findOne({ where: { id: orderId }, include: orderIncludeOptions() });
}

module.exports = { cancelOrder };
