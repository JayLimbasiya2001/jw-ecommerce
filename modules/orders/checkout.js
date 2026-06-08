"use strict";

const sequelize = require("../../config/db");
const { getGokwikConfig } = require("../../config/gokwik");
const { createGokwikOrder } = require("../../services/gokwik/client");
const { buildGokwikCreatePayload } = require("../../services/gokwik/orderPayload");
const { CartService } = require("../cart/service");
const { CustomerService } = require("../customer/service");
const { OrdersService } = require("./service");
const { OrderitemsService } = require("../orderitems/service");
const { CouponService } = require("../coupon/service");
const { AddressService } = require("../address/service");
const Product = require("../product/model");
const ProductVariant = require("../productvariant/model");
const {
  cartIncludeOptions,
  formatCartItem,
  validateCartLine,
} = require("../cart/cartLogic");
const { parseAddressField, orderIncludeOptions } = require("./ordersLogic");

function httpError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function isGokwikPayment(method) {
  const m = String(method || "").trim().toLowerCase();
  return ["gokwik", "online", "prepaid", "upi", "card"].includes(m);
}

function isCouponCurrentlyValid(coupon) {
  const now = new Date();
  if (coupon.validFrom && new Date(coupon.validFrom) > now) return false;
  if (coupon.validUntil && new Date(coupon.validUntil) < now) return false;
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) return false;
  return coupon.isActive !== false;
}

function calculateDiscount(subtotal, coupon) {
  if (!coupon) return 0;
  const min = parseFloat(coupon.minPurchaseAmount) || 0;
  if (subtotal < min) {
    throw httpError(`Minimum purchase of ${min} required for this coupon`, 400);
  }
  const value = parseFloat(coupon.discountValue) || 0;
  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = Math.round((subtotal * value) / 100);
    const max = coupon.maxDiscountAmount != null ? parseFloat(coupon.maxDiscountAmount) : null;
    if (max != null && discount > max) discount = Math.round(max);
  } else {
    discount = Math.round(value);
  }
  return Math.min(discount, subtotal);
}

async function resolveAddress(customerId, body) {
  let ship = body.shippingAddress;
  let bill = body.billingAddress;

  if (body.shippingAddressId) {
    const row = await AddressService.findOne({
      where: { id: body.shippingAddressId, customerId },
    });
    if (!row) throw httpError("Shipping address not found", 404);
    ship = row.get({ plain: true });
  }
  if (body.billingAddressId) {
    const row = await AddressService.findOne({
      where: { id: body.billingAddressId, customerId },
    });
    if (!row) throw httpError("Billing address not found", 404);
    bill = row.get({ plain: true });
  }

  if (!ship) throw httpError("shippingAddress or shippingAddressId is required", 400);
  if (!bill) bill = ship;

  return {
    shipPlain: ship,
    shhipingAddress: parseAddressField(ship),
    billingAddress: parseAddressField(bill),
  };
}

async function loadAndValidateCart(customerId) {
  const cartRows = await CartService.findAndCountAll({
    where: { customerId },
    include: cartIncludeOptions(),
  });
  const items = (cartRows.rows || []).map(formatCartItem);
  if (!items.length) throw httpError("Cart is empty", 400);

  for (const item of items) {
    await validateCartLine({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    });
  }
  return items;
}

async function placeOrderFromCart(customerId, body) {
  const items = await loadAndValidateCart(customerId);
  const paymentMethod = String(body.paymentMethod || "cod").trim().toLowerCase();
  const useGokwik = isGokwikPayment(paymentMethod);

  const gokwikConfig = getGokwikConfig();
  if (useGokwik && !gokwikConfig.enabled) {
    throw httpError("Online payment (GoKwik) is not enabled", 503);
  }

  const subTotal = items.reduce((sum, i) => sum + (i.lineTotal || 0), 0);
  const taxAmount = Math.max(parseInt(body.taxAmount, 10) || 0, 0);
  const shhipingCost = Math.max(parseInt(body.shippingCost ?? body.shhipingCost, 10) || 0, 0);

  let coupon = null;
  if (body.couponCode) {
    const code = String(body.couponCode).trim().toUpperCase();
    const row = await CouponService.findOne({ where: { couponCode: code, isActive: true } });
    if (!row) throw httpError("Invalid coupon code", 400);
    const plain = row.get({ plain: true });
    if (!isCouponCurrentlyValid(plain)) {
      throw httpError("Coupon is expired or usage limit reached", 400);
    }
    coupon = plain;
  }

  const discountAmount = calculateDiscount(subTotal, coupon);
  const totalAmount = Math.max(subTotal + taxAmount + shhipingCost - discountAmount, 0);
  const addresses = await resolveAddress(customerId, body);
  const customer = await CustomerService.findByIdPlain(customerId);

  const transaction = await sequelize.transaction();
  let order;
  try {
    order = await OrdersService.create(
      {
        customerId,
        orderStatus: "pending",
        paymentStatus: useGokwik ? "pending" : "pending",
        paymentMethod: useGokwik ? "gokwik" : paymentMethod,
        transactionId: useGokwik
          ? `GK_PENDING_${Date.now()}`
          : String(body.transactionId || "COD").trim(),
        subTotal,
        taxAmount,
        shhipingCost,
        discountAmount,
        totalAmount,
        currency: String(body.currency || "INR").trim(),
        shhipingAddress: addresses.shhipingAddress,
        billingAddress: addresses.billingAddress,
      },
      { transaction }
    );

    const linePayloads = items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      variantId: item.variantId,
      name: item.variant?.name || item.product?.name || "Product",
      sku: item.variant?.sku || item.product?.sku || "",
      qty: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.lineTotal,
    }));

    await OrderitemsService.bulkCreate(linePayloads, { transaction });

    if (!useGokwik) {
      for (const item of items) {
        if (item.variantId) {
          await ProductVariant.decrement("stock", {
            by: item.quantity,
            where: { id: item.variantId },
            transaction,
          });
        } else {
          await Product.decrement("stock", {
            by: item.quantity,
            where: { id: item.productId },
            transaction,
          });
        }
      }
      await CartService.remove({ where: { customerId }, transaction });
      if (coupon?.id) {
        await CouponService.update(
          { usageCount: (coupon.usageCount || 0) + 1 },
          { where: { id: coupon.id }, transaction }
        );
      }
      await OrdersService.update(
        {
          paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
          orderStatus: paymentMethod === "cod" ? "pending" : "confirmed",
        },
        { where: { id: order.id }, transaction }
      );
    }

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }

  const fullOrder = await OrdersService.findOne({
    where: { id: order.id },
    include: orderIncludeOptions(),
  });

  let gokwik = null;
  if (useGokwik) {
    const payload = buildGokwikCreatePayload({
      order: fullOrder.get({ plain: true }),
      customer,
      items,
      shipAddress: addresses.shhipingAddress,
    });
    gokwik = await createGokwikOrder(payload);
  }

  return { order: fullOrder, gokwik, paymentMode: useGokwik ? "gokwik" : paymentMethod };
}

module.exports = { placeOrderFromCart, isGokwikPayment };
