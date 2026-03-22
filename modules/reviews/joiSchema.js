"use strict";

const Joi = require("joi");

module.exports = {
  createValidation: Joi.object().keys({
    productId: Joi.number().integer().required(),
    userId: Joi.number().integer().required(),
    orderId: Joi.number().integer().allow(null),
    rating: Joi.number().integer().min(1).max(5).required(),
    title: Joi.string().allow(null, ""),
    comment: Joi.string().allow(null, ""),
    isVerifiedPurchase: Joi.boolean().default(false),
    isApproved: Joi.boolean().default(false),
    created_at: Joi.date(),
    updated_at: Joi.date()
  }),
  updateValidation: Joi.object().keys({
    productId: Joi.number().integer(),
    userId: Joi.number().integer(),
    orderId: Joi.number().integer().allow(null),
    rating: Joi.number().integer().min(1).max(5),
    title: Joi.string().allow(null, ""),
    comment: Joi.string().allow(null, ""),
    isVerifiedPurchase: Joi.boolean(),
    isApproved: Joi.boolean(),
    created_at: Joi.date(),
    updated_at: Joi.date()
  })
};

