"use strict";

const { authMiddleware } = require("../../middleware/auth");
const { requireStaff } = require("../../middleware/requireStaff");
const { refreshStaffModules } = require("../../middleware/refreshStaffModules");
const { requireModule } = require("../../middleware/requireModule");
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

router.post("/", joiValidator(createValidation), create);

const adminNewsletter = [
  authMiddleware,
  requireStaff,
  refreshStaffModules,
  requireModule("newsletter"),
];

router.get("/", ...adminNewsletter, getAll);
router.get("/:id", ...adminNewsletter, get);
router.patch("/:id", ...adminNewsletter, joiValidator(updateValidation), update);
router.delete("/:id", ...adminNewsletter, remove);

module.exports = router;
