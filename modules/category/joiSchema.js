
const Joi = require("joi");

module.exports = {
  createValidation: Joi.object({
    name: Joi.string().min(1).required(),
    slug: Joi.string().min(1).required(),
    description: Joi.string().allow("").default(""),
    image: Joi.string().min(1).required(),
    isActive: Joi.boolean().default(true),
    rank: Joi.number().integer().default(0),
  }).options({ stripUnknown: true }),
  updateValidation: Joi.object({
    name: Joi.string(),
    slug: Joi.string(),
    description: Joi.string().allow(""),
    image: Joi.string().allow(""),
    isActive: Joi.boolean(),
    rank: Joi.number().integer(),
  }).options({ stripUnknown: true }),
};
