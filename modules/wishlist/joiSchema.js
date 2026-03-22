
const Joi = require('joi');

module.exports = {
  createValidation: Joi.object().keys({
    userId: Joi.number().integer(),
    productId: Joi.number().integer(),
    created_at: Joi.date(),
    updated_at: Joi.date(),
  }),
  updateValidation: Joi.object().keys({
    userId: Joi.number().integer(),
    productId: Joi.number().integer(),
    created_at: Joi.date(),
    updated_at: Joi.date(),
  })
};
