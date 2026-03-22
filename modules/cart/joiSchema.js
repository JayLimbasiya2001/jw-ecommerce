"use strict";

const Joi = require("joi");

module.exports = {
  createValidation: Joi.object().keys({
    userId: Joi.number().integer().optional(),
    productId: Joi.number().integer().required(),
    variantId: Joi.number().integer().allow(null),
    quantity: Joi.number().integer().min(1).default(1),
    created_at: Joi.date(),
    updated_at: Joi.date()
  }),
  updateValidation: Joi.object().keys({
    quantity: Joi.number().integer().min(1),
    updated_at: Joi.date()
  })
};

