"use strict";

const { authMiddleware } = require("../../middleware/auth");
const { requireCustomer } = require("../../middleware/requireCustomer");
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

const adminReviews = [
  authMiddleware,
  requireStaff,
  refreshStaffModules,
  requireModule("reviews"),
];

router.post(
  "/",
  authMiddleware,
  requireCustomer,
  joiValidator(createValidation),
  create
);

router.get("/", ...adminReviews, getAll);
router.get("/:id", ...adminReviews, get);
router.patch("/:id", ...adminReviews, joiValidator(updateValidation), update);
router.delete("/:id", ...adminReviews, remove);

module.exports = router;
