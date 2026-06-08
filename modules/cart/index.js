"use strict";

const { authMiddleware } = require("../../middleware/auth");
const { requireCustomer } = require("../../middleware/requireCustomer");
const { joiValidator } = require("../../middleware/joiValidator");
const {
  create,
  getAll,
  update,
  get,
  remove,
  clear,
} = require("./controller");
const { createValidation, updateValidation } = require("./joiSchema");

const router = require("express").Router();

router.use(authMiddleware, requireCustomer);

router.post("/", joiValidator(createValidation), create);
router.get("/", getAll);
router.delete("/clear", clear);

router.get("/:id", get);
router.patch("/:id", joiValidator(updateValidation), update);
router.delete("/:id", remove);

module.exports = router;
