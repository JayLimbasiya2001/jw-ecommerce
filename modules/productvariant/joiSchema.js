
const Joi = require('joi');

module.exports = {
  createValidation: Joi.object().keys({
    productId: Joi.number().integer(),
    name: Joi.string(),
    sku: Joi.string(),
    price: Joi.number().integer(),
    stock: Joi.number().integer(),
    isActive: Joi.boolean(),
    created_at: Joi.date(),
    updated_at: Joi.date(),
  }),
  updateValidation: Joi.object().keys({
    productId: Joi.number().integer(),
    name: Joi.string(),
    sku: Joi.string(),
    price: Joi.number().integer(),
    stock: Joi.number().integer(),
    isActive: Joi.boolean(),
    created_at: Joi.date(),
    updated_at: Joi.date(),
  })
};
