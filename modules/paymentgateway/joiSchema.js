"use strict";

const Joi = require("joi");

module.exports = {
  createValidation: Joi.object().keys({
    gatewayName: Joi.string().required(),
    displayName: Joi.string().required(),
    apiKey: Joi.string().allow(null, ""),
    apiSecret: Joi.string().allow(null, ""),
    webhookSecret: Joi.string().allow(null, ""),
    isActive: Joi.boolean().default(false),
    isTestMode: Joi.boolean().default(true),
    configuration: Joi.string().allow(null, ""),
    created_at: Joi.date(),
    updated_at: Joi.date()
  }),
  updateValidation: Joi.object().keys({
    gatewayName: Joi.string(),
    displayName: Joi.string(),
    apiKey: Joi.string().allow(null, ""),
    apiSecret: Joi.string().allow(null, ""),
    webhookSecret: Joi.string().allow(null, ""),
    isActive: Joi.boolean(),
    isTestMode: Joi.boolean(),
    configuration: Joi.string().allow(null, ""),
    created_at: Joi.date(),
    updated_at: Joi.date()
  })
};

