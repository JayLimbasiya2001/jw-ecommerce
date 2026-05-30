"use strict";

const { adminModule } = require("../../middleware/adminAccess");
const { joiValidator } = require("../../middleware/joiValidator");
const {
  create,
  getAll,
  update,
  get,
  remove,
  validateByCode,
} = require("./controller");
const {
  createValidation,
  updateValidation,
} = require("./joiSchema");

const router = require("express").Router();

/** Public — validate coupon at checkout */
router.get("/validate/:code", validateByCode);

router.get("/", ...adminModule("coupons"), getAll);
router.get("/:id", ...adminModule("coupons"), get);

router.post(
  "/",
  ...adminModule("coupons"),
  joiValidator(createValidation),
  create
);

router.patch(
  "/:id",
  ...adminModule("coupons"),
  joiValidator(updateValidation),
  update
);

router.delete("/:id", ...adminModule("coupons"), remove);

module.exports = router;
