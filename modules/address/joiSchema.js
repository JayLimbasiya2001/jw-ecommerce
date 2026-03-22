
const Joi = require('joi');

module.exports = {
  createValidation: Joi.object().keys({
    userId: Joi.number().integer(),
    address_type: Joi.string(),
    name: Joi.string().allow(null),
    phone: Joi.string(),
    address_line1: Joi.string(),
    address_line2: Joi.string().allow(null),
    postalCode: Joi.number().integer(),
    city: Joi.string(),
    state: Joi.string(),
    country: Joi.string(),
    created_at: Joi.date(),
    updated_at: Joi.date(),
  }),
  updateValidation: Joi.object().keys({
    userId: Joi.number().integer(),
    address_type: Joi.string(),
    name: Joi.string().allow(null),
    phone: Joi.string(),
    address_line1: Joi.string(),
    address_line2: Joi.string().allow(null),
    postalCode: Joi.number().integer(),
    city: Joi.string(),
    state: Joi.string(),
    country: Joi.string(),
    created_at: Joi.date(),
    updated_at: Joi.date(),
  })
};
