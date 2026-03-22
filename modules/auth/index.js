"use strict";

const router = require("express").Router();
const { joiValidator } = require("../../middleware/joiValidator");
const Joi = require("joi");
const { register, login } = require("./controller");

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": '"email" is required',
    "any.required": '"email" is required'
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": '"password" is required',
    "any.required": '"password" is required'
  }),
  name: Joi.string().trim().required().messages({
    "string.empty": '"name" is required',
    "any.required": '"name" is required'
  }),
  phone: Joi.string().allow(null, "").optional(),
  role: Joi.string().valid("admin", "customer", "superAdmin").optional()
}).options({ stripUnknown: true });

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": '"email" is required',
    "any.required": '"email" is required'
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": '"password" is required',
    "any.required": '"password" is required'
  })
}).options({ stripUnknown: true });

router.post(
  "/register",
  joiValidator(registerSchema, {
    example: { email: "user@example.com", password: "secret123", name: "John Doe" }
  }),
  register
);
router.post("/login", joiValidator(loginSchema), login);

module.exports = router;

