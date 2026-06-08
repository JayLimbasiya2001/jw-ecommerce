"use strict";

const sequelize = require("../../config/db");
const { CartService } = require("../../modules/cart/service");
const { OrdersService } = require("../../modules/orders/service");
const { CouponService } = require("../../modules/coupon/service");
const Product = require("../../modules/product/model");
const ProductVariant = require("../../modules/productvariant/model");
const OrderItem = require("../../modules/orderitems/model");

/**
 * After successful GoKwik payment: decrement stock, clear cart, mark order paid.
 */
async function finalizePaidOrder(
  orderId,
  { transactionId, paymentMethod = "gokwik", couponId } = {}
) {
  const order = await OrdersService.findOne({
    where: { id: orderId },
    include: [{ model: OrderItem, as: "items" }],
  });
  if (!order) {
    const err = new Error("Order not found");
    err.statusCode = 404;
    throw err;
  }

  const plain = order.get({ plain: true });
  if (plain.paymentStatus === "paid") {
    return order;
  }

  const transaction = await sequelize.transaction();
  try {
    const items = plain.items || [];
    for (const item of items) {
      if (item.variantId) {
        await ProductVariant.decrement("stock", {
          by: item.qty,
          where: { id: item.variantId },
          transaction,
        });
      } else {
        await Product.decrement("stock", {
          by: item.qty,
          where: { id: item.productId },
          transaction,
        });
      }
    }

    await CartService.remove({ where: { customerId: plain.customerId }, transaction });

    if (couponId) {
      const coupon = await CouponService.findOne({ where: { id: couponId } });
      if (coupon) {
        const c = coupon.get({ plain: true });
        await CouponService.update(
          { usageCount: (c.usageCount || 0) + 1 },
          { where: { id: couponId }, transaction }
        );
      }
    }

    await OrdersService.update(
      {
        paymentStatus: "paid",
        orderStatus: "confirmed",
        paymentMethod,
        transactionId: transactionId || plain.transactionId,
      },
      { where: { id: orderId }, transaction }
    );

    await transaction.commit();

    return OrdersService.findOne({ where: { id: orderId } });
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function cancelPendingGokwikOrder(orderId, reason = "payment_failed") {
  await OrdersService.update(
    {
      paymentStatus: "failed",
      orderStatus: "cancelled",
      transactionId: reason,
    },
    { where: { id: orderId, paymentStatus: "pending" } }
  );
}

module.exports = { finalizePaidOrder, cancelPendingGokwikOrder };
