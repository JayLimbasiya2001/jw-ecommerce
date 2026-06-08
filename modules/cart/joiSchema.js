"use strict";

const Joi = require("joi");

module.exports = {
  createValidation: Joi.object({
    productId: Joi.number().integer().required(),
    variantId: Joi.number().integer().allow(null).optional(),
    quantity: Joi.number().integer().min(1).default(1),
  }).options({ stripUnknown: true }),
  updateValidation: Joi.object({
    quantity: Joi.number().integer().min(1).required(),
  }).options({ stripUnknown: true }),
};
