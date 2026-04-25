"use strict";

const Joi = require("joi");

module.exports = {
  createValidation: Joi.object({
    attributeId: Joi.number().integer().required(),
    value: Joi.string().min(1).max(255).required(),
    sortOrder: Joi.number().integer().optional(),
  }).options({ stripUnknown: true }),
  updateValidation: Joi.object({
    attributeId: Joi.number().integer().optional(),
    value: Joi.string().min(1).max(255).optional(),
    sortOrder: Joi.number().integer().optional(),
  })
    .min(1)
    .options({ stripUnknown: true }),
};
