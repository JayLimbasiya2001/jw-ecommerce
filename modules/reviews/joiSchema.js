"use strict";

const Joi = require("joi");

module.exports = {
  createValidation: Joi.object({
    productId: Joi.number().integer().required(),
    orderId: Joi.number().integer().allow(null).optional(),
    rating: Joi.number().integer().min(1).max(5).required(),
    title: Joi.string().allow(null, "").max(200).optional(),
    comment: Joi.string().allow(null, "").max(5000).optional(),
  }).options({ stripUnknown: true }),

  updateValidation: Joi.object({
    rating: Joi.number().integer().min(1).max(5).optional(),
    title: Joi.string().allow(null, "").max(200).optional(),
    comment: Joi.string().allow(null, "").max(5000).optional(),
    isApproved: Joi.boolean().optional(),
    isVerifiedPurchase: Joi.boolean().optional(),
  })
    .min(1)
    .options({ stripUnknown: true }),
};
