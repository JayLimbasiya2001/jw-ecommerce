
const Joi = require('joi');

module.exports = {
  createValidation: Joi.object({
    title: Joi.string().min(1).required(),
    subTitle: Joi.string().allow("").default(""),
    image: Joi.string().min(1).required(),
    mobileImage: Joi.string().allow("").default(""),
    buttonText: Joi.string().allow("").default(""),
    buttonLink: Joi.string().allow("").default(""),
    isActive: Joi.any().optional(),
    rank: Joi.any().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
  }).options({ stripUnknown: true }),
  updateValidation: Joi.object({
    title: Joi.string(),
    subTitle: Joi.string().allow(""),
    image: Joi.string().allow(""),
    mobileImage: Joi.string().allow(""),
    buttonText: Joi.string().allow(""),
    buttonLink: Joi.string().allow(""),
    isActive: Joi.boolean(),
    rank: Joi.number().integer(),
    startDate: Joi.date(),
    endDate: Joi.date(),
  }).options({ stripUnknown: true })
};
