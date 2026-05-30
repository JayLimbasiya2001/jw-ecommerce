"use strict";

const Joi = require("joi");

const couponFields = {
  couponCode: Joi.string().trim().uppercase(),
  description: Joi.string().allow(null, ""),
  discountType: Joi.string().valid("percentage", "fixed"),
  discountValue: Joi.number().positive().precision(2),
  minPurchaseAmount: Joi.number().min(0).precision(2),
  maxDiscountAmount: Joi.number().positive().precision(2).allow(null),
  usageLimit: Joi.number().integer().min(1).allow(null),
  usageCount: Joi.number().integer().min(0),
  perUserLimit: Joi.number().integer().min(1),
  isActive: Joi.boolean(),
  validFrom: Joi.date().allow(null),
  validUntil: Joi.date().allow(null),
};

module.exports = {
  createValidation: Joi.object()
    .keys({
      ...couponFields,
      couponCode: Joi.string().trim().uppercase().required(),
      discountType: Joi.string().valid("percentage", "fixed").required(),
      discountValue: Joi.number().positive().precision(2).required(),
      minPurchaseAmount: Joi.number().min(0).precision(2).default(0),
      usageCount: Joi.number().integer().min(0).default(0),
      perUserLimit: Joi.number().integer().min(1).default(1),
      isActive: Joi.boolean().default(true),
    })
    .options({ stripUnknown: true }),
  updateValidation: Joi.object()
    .keys(couponFields)
    .min(1)
    .options({ stripUnknown: true }),
};
