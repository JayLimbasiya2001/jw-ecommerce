const Joi = require("joi");

/** One SKU line: reserved keys + any extra keys become dynamic attributes (color, size, …). */
const variantCreateItem = Joi.object()
  .keys({
    sku: Joi.string().optional(),
    price: Joi.number().integer().optional(),
    stock: Joi.number().integer().optional(),
    name: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
    image: Joi.string().optional(),
    attributeValueIds: Joi.array().items(Joi.number().integer()).optional(),
    attributes: Joi.object()
      .pattern(
        Joi.string(),
        Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean())
      )
      .optional(),
  })
  .unknown(true);

module.exports = {
  createValidation: Joi.object().keys({
    categoryId: Joi.number().integer(),
    brandId: Joi.number().integer(),
    name: Joi.string(),
    slug: Joi.string(),
    sku: Joi.string(),
    description: Joi.string(),
    basePrice: Joi.number().integer(),
    salePrice: Joi.number().integer(),
    metalType: Joi.string(),
    stoneType: Joi.string(),
    weight: Joi.string(),
    stock: Joi.number().integer(),
    isTrending: Joi.boolean(),
    isNewArrival: Joi.boolean(),
    isBestSeller: Joi.boolean(),
    isActive: Joi.boolean(),
    created_at: Joi.date(),
    updated_at: Joi.date(),
    /** When set, creates SKUs in the same transaction. Example: `[{ color: "red", size: "M", price: 500, stock: 5 }]` */
    variants: Joi.array().items(variantCreateItem).optional(),
  }),
  updateValidation: Joi.object().keys({
    categoryId: Joi.number().integer(),
    brandId: Joi.number().integer(),
    name: Joi.string(),
    slug: Joi.string(),
    sku: Joi.string(),
    description: Joi.string(),
    basePrice: Joi.number().integer(),
    salePrice: Joi.number().integer(),
    metalType: Joi.string(),
    stoneType: Joi.string(),
    weight: Joi.string(),
    stock: Joi.number().integer(),
    isTrending: Joi.boolean(),
    isNewArrival: Joi.boolean(),
    isBestSeller: Joi.boolean(),
    isActive: Joi.boolean(),
    created_at: Joi.date(),
    updated_at: Joi.date(),
  }),
};
