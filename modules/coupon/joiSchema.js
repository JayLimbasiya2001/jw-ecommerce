"use strict";

const Joi = require("joi");

module.exports = {
  createValidation: Joi.object().keys({
    couponCode: Joi.string().required(),
    description: Joi.string().allow(null, ""),
    discountType: Joi.string().valid("percentage", "fixed").required(),
    discountValue: Joi.number().precision(2).required(),
    minPurchaseAmount: Joi.number().precision(2).default(0),
    maxDiscountAmount: Joi.number().precision(2).allow(null),
    usageLimit: Joi.number().integer().allow(null),
    usageCount: Joi.number().integer().default(0),
    perUserLimit: Joi.number().integer().default(1),
    isActive: Joi.boolean().default(true),
    validFrom: Joi.date().allow(null),
    validUntil: Joi.date().allow(null),
    created_at: Joi.date()
  }),
  updateValidation: Joi.object().keys({
    description: Joi.string().allow(null, ""),
    discountType: Joi.string().valid("percentage", "fixed"),
    discountValue: Joi.number().precision(2),
    minPurchaseAmount: Joi.number().precision(2),
    maxDiscountAmount: Joi.number().precision(2).allow(null),
    usageLimit: Joi.number().integer().allow(null),
    usageCount: Joi.number().integer(),
    perUserLimit: Joi.number().integer(),
    isActive: Joi.boolean(),
    validFrom: Joi.date().allow(null),
    validUntil: Joi.date().allow(null),
    created_at: Joi.date()
  })
};

