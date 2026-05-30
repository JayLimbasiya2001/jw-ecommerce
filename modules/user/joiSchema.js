
const Joi = require("joi");

module.exports = {
  createValidation: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().required(),
    phone: Joi.string().allow(null, ""),
    role: Joi.string().valid("admin", "superAdmin").required(),
    isVerified: Joi.boolean().optional(),
  }),
  updateValidation: Joi.object().keys({
    email: Joi.string().email(),
    password: Joi.string().min(6),
    name: Joi.string(),
    phone: Joi.string().allow(null, ""),
    role: Joi.string().valid("admin", "superAdmin"),
    isVerified: Joi.boolean(),
  }).min(1),
};
