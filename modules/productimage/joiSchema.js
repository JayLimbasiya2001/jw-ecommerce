
const Joi = require('joi');

module.exports = {
  createValidation: Joi.object().keys({
    productId: Joi.number().integer(),
    image: Joi.string(),
    altText: Joi.string(),
    isPrimary: Joi.boolean(),
    rank: Joi.number().integer(),
    created_at: Joi.date(),
    updated_at: Joi.date(),
  }),
  updateValidation: Joi.object().keys({
    productId: Joi.number().integer(),
    image: Joi.string(),
    altText: Joi.string(),
    isPrimary: Joi.boolean(),
    rank: Joi.number().integer(),
    created_at: Joi.date(),
    updated_at: Joi.date(),
  })
};
