
const Joi = require('joi');

module.exports = {
  createValidation: Joi.object().keys({
    customerId: Joi.number().integer(),
    orderStatus: Joi.string(),
    paymentStatus: Joi.string(),
    paymentMethod: Joi.string(),
    transactionId: Joi.string(),
    subTotal: Joi.number().integer(),
    taxAmount: Joi.number().integer(),
    shhipingCost: Joi.number().integer(),
    discountAmount: Joi.number().integer(),
    totalAmount: Joi.number().integer(),
    currency: Joi.string(),
    shhipingAddress: Joi.string(),
    billingAddress: Joi.string(),
    created_at: Joi.date(),
    updated_at: Joi.date(),
  }),
  updateValidation: Joi.object().keys({
    customerId: Joi.number().integer(),
    orderStatus: Joi.string(),
    paymentStatus: Joi.string(),
    paymentMethod: Joi.string(),
    transactionId: Joi.string(),
    subTotal: Joi.number().integer(),
    taxAmount: Joi.number().integer(),
    shhipingCost: Joi.number().integer(),
    discountAmount: Joi.number().integer(),
    totalAmount: Joi.number().integer(),
    currency: Joi.string(),
    shhipingAddress: Joi.string(),
    billingAddress: Joi.string(),
    created_at: Joi.date(),
    updated_at: Joi.date(),
  })
};
