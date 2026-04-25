"use strict";

const Joi = require("joi");

module.exports = {
  createValidation: Joi.object({
    key: Joi.string().min(1).max(64).required(),
    name: Joi.string().min(1).max(255).required(),
    isActive: Joi.boolean().optional(),
    sortOrder: Joi.number().integer().optional(),
  }).options({ stripUnknown: true }),
  updateValidation: Joi.object({
    key: Joi.string().min(1).max(64).optional(),
    name: Joi.string().min(1).max(255).optional(),
    isActive: Joi.boolean().optional(),
    sortOrder: Joi.number().integer().optional(),
  })
    .min(1)
    .options({ stripUnknown: true }),
};
