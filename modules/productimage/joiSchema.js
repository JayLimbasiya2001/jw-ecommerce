
const Joi = require("joi");

module.exports = {
  createValidation: Joi.object().keys({
    productId: Joi.number().integer().required(),
    variantId: Joi.number().integer().allow(null).optional(),
    /** Single upload (field name `image`) or JSON URL */
    image: Joi.string().optional(),
    /** Multiple uploads (field name `images` repeated) — paths set by multer */
    images: Joi.array().items(Joi.string()).optional(),
    altText: Joi.string().allow("").optional(),
    isPrimary: Joi.boolean().optional(),
    rank: Joi.number().integer().optional(),
  }),
  updateValidation: Joi.object().keys({
    productId: Joi.number().integer().optional(),
    variantId: Joi.number().integer().allow(null).optional(),
    image: Joi.string().optional(),
    altText: Joi.string().allow("").optional(),
    isPrimary: Joi.boolean().optional(),
    rank: Joi.number().integer().optional(),
  }).min(1),
};
