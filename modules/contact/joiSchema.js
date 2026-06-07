"use strict";

const Joi = require("joi");

module.exports = {
  submitValidation: Joi.object({
    name: Joi.string().trim().min(2).max(120).required(),
    email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required(),
    phone: Joi.string().trim().max(30).allow(null, "").optional(),
    message: Joi.string().trim().min(10).max(5000).required(),
  }).options({ stripUnknown: true }),
};
