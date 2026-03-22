"use strict";

const Joi = require("joi");

module.exports = {
  createValidation: Joi.object().keys({
    email: Joi.string().email().required(),
    name: Joi.string().allow(null, ""),
    isActive: Joi.boolean().default(true),
    subscribed_at: Joi.date(),
    unsubscribed_at: Joi.date().allow(null),
    verificationToken: Joi.string().allow(null, ""),
    isVerified: Joi.boolean().default(false)
  }),
  updateValidation: Joi.object().keys({
    name: Joi.string().allow(null, ""),
    isActive: Joi.boolean(),
    unsubscribed_at: Joi.date().allow(null),
    verificationToken: Joi.string().allow(null, ""),
    isVerified: Joi.boolean()
  })
};

