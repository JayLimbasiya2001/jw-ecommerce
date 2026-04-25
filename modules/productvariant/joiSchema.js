const Joi = require("joi");

module.exports = {
  createValidation: Joi.object().keys({
    productId: Joi.number().integer().required(),
    name: Joi.string().allow("").optional(),
    /**
     * Shorthand: { "color": "red", "size": "M", "purity": "18k" } — creates/finds global attribute + value rows.
     * Merged with `attributeValueIds` (object wins on the same attribute type).
     */
    attributes: Joi.object()
      .pattern(
        Joi.string(),
        Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean())
      )
      .optional(),
    /** Use pre-defined global value ids; one per attribute type. */
    attributeValueIds: Joi.array().items(Joi.number().integer()).optional(),
    sku: Joi.string().required(),
    price: Joi.number().integer().required(),
    stock: Joi.number().integer().required(),
    isActive: Joi.boolean().optional(),
    image: Joi.string().optional(),
  }),
  updateValidation: Joi.object()
    .keys({
      productId: Joi.number().integer().optional(),
      name: Joi.string().optional(),
      attributes: Joi.object()
        .pattern(
          Joi.string(),
          Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean())
        )
        .optional(),
      attributeValueIds: Joi.array().items(Joi.number().integer()).optional(),
      sku: Joi.string().optional(),
      price: Joi.number().integer().optional(),
      stock: Joi.number().integer().optional(),
      isActive: Joi.boolean().optional(),
      image: Joi.string().optional(),
    })
    .min(1),
};
