"use strict";

const { adminModule } = require("../../middleware/adminAccess");
const { joiValidator } = require("../../middleware/joiValidator");
const {
  create,
  getAll,
  update,
  get,
  remove
} = require("./controller");
const {
  createValidation,
  updateValidation
} = require("./joiSchema");

const router = require("express").Router();

router.use(...adminModule("coupons"));

router
  .route("/")
  .post(joiValidator(createValidation), create)
  .get(getAll);

router
  .route("/:id")
  .patch(joiValidator(updateValidation), update)
  .get(get)
  .delete(remove);

module.exports = router;
