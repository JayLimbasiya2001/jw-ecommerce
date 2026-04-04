
"use strict";

const { authMiddleware } = require("../../middleware/auth");
const { requireRole } = require("../../middleware/requireRole");
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

const adminOrSuperAdmin = requireRole(["superAdmin", "admin"]);

// Public: anyone can list and view products
router.get("/", getAll);
router.get("/:id", get);

// Protected: only superAdmin and admin can create, update, delete
router.post(
  "/",
  authMiddleware,
  adminOrSuperAdmin,
  joiValidator(createValidation),
  create
);

router.put(
  "/:id",
  authMiddleware,
  adminOrSuperAdmin,
  joiValidator(updateValidation),
  update
);

router.delete(
  "/:id",
  authMiddleware,
  adminOrSuperAdmin,
  remove
);

module.exports = router;
