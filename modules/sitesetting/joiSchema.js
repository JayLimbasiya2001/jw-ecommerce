"use strict";

const Joi = require("joi");

module.exports = {
  createValidation: Joi.object().keys({
    settingKey: Joi.string().required(),
    settingValue: Joi.string().allow(null, ""),
    settingType: Joi.string().allow(null, ""),
    description: Joi.string().allow(null, ""),
    updated_at: Joi.date()
  }),
  updateValidation: Joi.object().keys({
    settingValue: Joi.string().allow(null, ""),
    settingType: Joi.string().allow(null, ""),
    description: Joi.string().allow(null, ""),
    updated_at: Joi.date()
  })
};

