
const Joi = require("joi");

module.exports = {
  createValidation: Joi.object().keys({
    productId: Joi.number().integer().required(),
    /** Optional if color+size or sku present — server builds a display name */
    name: Joi.string().allow("").optional(),
    color: Joi.string().allow("", null).optional(),
    size: Joi.string().allow("", null).optional(),
    sku: Joi.string().required(),
    price: Joi.number().integer().required(),
    stock: Joi.number().integer().required(),
    isActive: Joi.boolean().optional(),
    image: Joi.string().optional(),
  }),
  updateValidation: Joi.object().keys({
    productId: Joi.number().integer().optional(),
    name: Joi.string().optional(),
    color: Joi.string().allow("", null).optional(),
    size: Joi.string().allow("", null).optional(),
    sku: Joi.string().optional(),
    price: Joi.number().integer().optional(),
    stock: Joi.number().integer().optional(),
    isActive: Joi.boolean().optional(),
    image: Joi.string().optional(),
  }).min(1),
};
