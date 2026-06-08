"use strict";

const OrderItem = require("../orderitems/model");
const Product = require("../product/model");
const ProductVariant = require("../productvariant/model");
const Customer = require("../customer/model");

function orderIncludeOptions() {
  return [
    {
      model: OrderItem,
      as: "items",
      required: false,
      include: [
        { model: Product, attributes: ["id", "name", "slug"] },
        {
          model: ProductVariant,
          required: false,
          attributes: ["id", "name", "sku", "price"],
        },
      ],
    },
    {
      model: Customer,
      attributes: ["id", "name", "email", "phone"],
    },
  ];
}

function formatOrder(row) {
  const plain = row.get ? row.get({ plain: true }) : { ...row };
  return {
    id: plain.id,
    customerId: plain.customerId,
    orderStatus: plain.orderStatus,
    paymentStatus: plain.paymentStatus,
    paymentMethod: plain.paymentMethod,
    transactionId: plain.transactionId,
    subTotal: plain.subTotal,
    taxAmount: plain.taxAmount,
    shhipingCost: plain.shhipingCost,
    discountAmount: plain.discountAmount,
    totalAmount: plain.totalAmount,
    currency: plain.currency,
    shhipingAddress: plain.shhipingAddress,
    billingAddress: plain.billingAddress,
    customer: plain.customer || null,
    items: (plain.items || []).map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      variantId: item.variantId,
      name: item.name,
      sku: item.sku,
      qty: item.qty,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      product: item.product || null,
      variant: item.productvariant || null,
    })),
    created_at: plain.created_at,
    updated_at: plain.updated_at,
  };
}

function parseAddressField(value) {
  if (value == null) return null;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

module.exports = {
  orderIncludeOptions,
  formatOrder,
  parseAddressField,
};
