"use strict";

const Joi = require("joi");

const addressObject = Joi.object({
  name: Joi.string().allow(null, ""),
  phone: Joi.string().allow(null, ""),
  address_line1: Joi.string().required(),
  address_line2: Joi.string().allow(null, ""),
  city: Joi.string().required(),
  state: Joi.string().required(),
  country: Joi.string().required(),
  postalCode: Joi.alternatives().try(Joi.string(), Joi.number()),
});

module.exports = {
  checkoutValidation: Joi.object({
    shippingAddressId: Joi.number().integer().optional(),
    billingAddressId: Joi.number().integer().optional(),
    shippingAddress: addressObject.optional(),
    billingAddress: addressObject.optional(),
    paymentMethod: Joi.string()
      .trim()
      .valid("cod", "gokwik", "online", "prepaid", "upi", "card")
      .default("cod"),
    transactionId: Joi.string().allow(null, "").optional(),
    couponCode: Joi.string().trim().optional(),
    taxAmount: Joi.number().integer().min(0).default(0),
    shippingCost: Joi.number().integer().min(0).default(0),
    shhipingCost: Joi.number().integer().min(0).optional(),
    currency: Joi.string().default("INR"),
  })
    .or("shippingAddressId", "shippingAddress")
    .options({ stripUnknown: true }),

  updateValidation: Joi.object({
    orderStatus: Joi.string()
      .valid("pending", "confirmed", "processing", "shipped", "delivered", "cancelled")
      .optional(),
    paymentStatus: Joi.string().valid("pending", "paid", "failed", "refunded").optional(),
    paymentMethod: Joi.string().optional(),
    transactionId: Joi.string().allow(null, "").optional(),
    taxAmount: Joi.number().integer().min(0).optional(),
    shhipingCost: Joi.number().integer().min(0).optional(),
    discountAmount: Joi.number().integer().min(0).optional(),
    totalAmount: Joi.number().integer().min(0).optional(),
  })
    .min(1)
    .options({ stripUnknown: true }),

  cancelValidation: Joi.object({
    reason: Joi.string().allow(null, "").max(200).optional(),
  }).options({ stripUnknown: true }),
};
