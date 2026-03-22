
const Joi = require('joi');

module.exports = {
  createValidation: Joi.object().keys({
    email: Joi.string(),
    password: Joi.string(),
    name: Joi.string(),
    phone: Joi.string().allow(null),
    role: Joi.string(),
    isVerified: Joi.boolean(),
    deleted_at: Joi.date(),
  }),
  updateValidation: Joi.object().keys({
    email: Joi.string(),
    password: Joi.string(),
    name: Joi.string(),
    phone: Joi.string().allow(null),
    role: Joi.string(),
    isVerified: Joi.boolean(),
    deleted_at: Joi.date(),
  })
};
