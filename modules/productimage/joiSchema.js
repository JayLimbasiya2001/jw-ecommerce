
const Joi = require("joi");

const imageFields = {
  productId: Joi.number().integer().required(),
  /**
   * Omit → product main/gallery images (variantId stored as null).
   * Send → images belong to that variant (must belong to productId).
   */
  variantId: Joi.number().integer().optional(),
  image: Joi.string().optional(),
  images: Joi.array().items(Joi.string()).min(1).optional(),
  altText: Joi.string().allow("").optional(),
  isPrimary: Joi.boolean().optional(),
  rank: Joi.number().integer().optional(),
};

module.exports = {
  createValidation: Joi.object()
    .keys(imageFields)
    .or("image", "images")
    .messages({
      "object.missing":
        "Provide at least one image via `image` or `images` (file upload or URL)",
    }),
  updateValidation: Joi.object()
    .keys({
      productId: Joi.number().integer().optional(),
      variantId: Joi.number().integer().allow(null).optional(),
      image: Joi.string().optional(),
      altText: Joi.string().allow("").optional(),
      isPrimary: Joi.boolean().optional(),
      rank: Joi.number().integer().optional(),
    })
    .min(1),
};
