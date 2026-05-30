"use strict";

const router = require("express").Router();
const { joiValidator } = require("../../middleware/joiValidator");
const { authMiddleware } = require("../../middleware/auth");
const Joi = require("joi");
const {
  registerCustomer,
  loginCustomer,
  loginAdmin,
  me,
  register,
  login,
} = require("./controller");

const registerCustomerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().trim().required(),
  phone: Joi.string().allow(null, "").optional(),
}).options({ stripUnknown: true });

const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": "email is required",
      "any.required": "email is required",
      "string.email": "email must be a valid email address",
    }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "password is required",
    "any.required": "password is required",
    "string.min": "password must be at least 6 characters",
  }),
}).options({ stripUnknown: true });

router.post(
  "/customer/register",
  joiValidator(registerCustomerSchema),
  registerCustomer
);
router.post("/customer/login", joiValidator(loginSchema), loginCustomer);
router.post("/admin/login", joiValidator(loginSchema, {
  example: { email: "admin@example.com", password: "secret123" },
}), loginAdmin);
const { refreshStaffModules } = require("../../middleware/refreshStaffModules");

router.get("/me", authMiddleware, refreshStaffModules, me);

router.post("/register", joiValidator(registerCustomerSchema), register);
router.post("/login", login);

module.exports = router;
