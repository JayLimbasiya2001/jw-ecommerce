
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
} = require("./controller");
const {
  createValidation,
  updateValidation,
} = require("./joiSchema");

const router = require("express").Router();

router.use(authMiddleware, requireCustomer);

router.route("/")
  .post(joiValidator(createValidation), create)
  .get(getAll);

router.route("/:id")
  .get(get)
  .delete(remove);

module.exports = router;
