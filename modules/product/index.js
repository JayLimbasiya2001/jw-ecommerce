
"use strict";

const { adminModule } = require("../../middleware/adminAccess");
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

router.get("/", getAll);
router.get("/:id", get);

router.post(
  "/",
  ...adminModule("products"),
  joiValidator(createValidation),
  create
);

router.put(
  "/:id",
  ...adminModule("products"),
  joiValidator(updateValidation),
  update
);

router.delete("/:id", ...adminModule("products"), remove);

module.exports = router;
