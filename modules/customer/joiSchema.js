"use strict";

const Joi = require("joi");

const customerFields = {
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }),
  password: Joi.string().min(6),
  name: Joi.string().trim(),
  phone: Joi.string().allow(null, ""),
  profileImage: Joi.string().allow(null, ""),
  isVerified: Joi.boolean(),
};

module.exports = {
  createValidation: Joi.object()
    .keys({
      ...customerFields,
      email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required(),
      password: Joi.string().min(6).required(),
      name: Joi.string().trim().required(),
      phone: Joi.string().allow(null, "").optional(),
      isVerified: Joi.boolean().optional(),
    })
    .options({ stripUnknown: true }),
  updateValidation: Joi.object()
    .keys({
      ...customerFields,
      password: Joi.string().min(6).optional(),
    })
    .min(1)
    .options({ stripUnknown: true }),
};
