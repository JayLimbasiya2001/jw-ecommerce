"use strict";

const { getGokwikConfig } = require("../../config/gokwik");

function parseAddressJson(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return { address_line1: String(raw) };
  }
}

function splitName(fullName) {
  const parts = String(fullName || "Customer").trim().split(/\s+/);
  return {
    first_name: parts[0] || "Customer",
    last_name: parts.slice(1).join(" ") || "",
  };
}

/**
 * Build GoKwik v3 create-order payload from our order + customer + cart lines.
 */
function buildGokwikCreatePayload({ order, customer, items, shipAddress }) {
  const config = getGokwikConfig();
  const addr = parseAddressJson(shipAddress);
  const { first_name, last_name } = splitName(customer?.name || addr.name);

  const lineItems = items.map((item) => ({
    product_id: String(item.productId),
    variant_id: item.variantId != null ? String(item.variantId) : "",
    name: item.variant?.name || item.product?.name || "Product",
    sku: item.variant?.sku || item.product?.sku || "",
    quantity: item.quantity,
    price: item.unitPrice,
    image_url: item.variant?.image || item.product?.image || "",
  }));

  return {
    merchant_order_id: String(order.id),
    order_total: order.totalAmount,
    subtotal: order.subTotal,
    discount: order.discountAmount,
    tax: order.taxAmount,
    shipping: order.shhipingCost,
    currency: order.currency || "INR",
    customer: {
      email: customer?.email || "",
      phone: customer?.phone || addr.phone || "",
      first_name,
      last_name,
    },
    shipping_address: {
      name: customer?.name || addr.name || `${first_name} ${last_name}`.trim(),
      phone: customer?.phone || addr.phone || "",
      address_line1: addr.address_line1 || "",
      address_line2: addr.address_line2 || "",
      city: addr.city || "",
      state: addr.state || "",
      country: addr.country || "IN",
      postal_code: String(addr.postalCode ?? ""),
    },
    line_items: lineItems,
    redirect_url: `${config.frontendUrl}/order/success?orderId=${order.id}`,
    webhook_url: `${config.appUrl}/api/payments/gokwik/webhook`,
    mid: config.merchantId,
  };
}

function mapGokwikPaymentStatus(event) {
  const status = String(event?.payment_status || event?.status || "").toLowerCase();
  if (["paid", "success", "successful", "completed"].includes(status)) return "paid";
  if (["failed", "failure", "cancelled", "canceled"].includes(status)) return "failed";
  if (["refunded", "refund"].includes(status)) return "refunded";
  return "pending";
}

function mapGokwikOrderStatus(paymentStatus) {
  if (paymentStatus === "paid") return "confirmed";
  if (paymentStatus === "failed") return "cancelled";
  return "pending";
}

module.exports = {
  buildGokwikCreatePayload,
  mapGokwikPaymentStatus,
  mapGokwikOrderStatus,
  parseAddressJson,
};
