"use strict";

const Joi = require("joi");

module.exports = {
  subscribeValidation: Joi.object({
    email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required(),
    name: Joi.string().allow(null, "").optional(),
  }).options({ stripUnknown: true }),
};
