
const Joi = require('joi');

module.exports = {
  createValidation: Joi.object().keys({
    orderId: Joi.number().integer(),
    productId: Joi.number().integer(),
    variantId: Joi.number().integer(),
    name: Joi.string(),
    sku: Joi.string(),
    qty: Joi.number().integer(),
    unitPrice: Joi.number().integer(),
    totalPrice: Joi.number().integer(),
    created_at: Joi.date(),
    updated_at: Joi.date(),
  }),
  updateValidation: Joi.object().keys({
    orderId: Joi.number().integer(),
    productId: Joi.number().integer(),
    variantId: Joi.number().integer(),
    name: Joi.string(),
    sku: Joi.string(),
    qty: Joi.number().integer(),
    unitPrice: Joi.number().integer(),
    totalPrice: Joi.number().integer(),
    created_at: Joi.date(),
    updated_at: Joi.date(),
  })
};
