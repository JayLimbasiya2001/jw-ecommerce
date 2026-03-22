
"use strict";

const { authMiddleware } = require("../../middleware/auth");
const { requireRole } = require("../../middleware/requireRole");
const { joiValidator } = require("../../middleware/joiValidator");
const { brandUpload, brandAttachPath } = require("../../middleware/upload");
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

const withBrandUpload = (req, res, next) => {
  const isMultipart = (req.get("content-type") || "").includes("multipart/form-data");
  if (!isMultipart) return next();

  brandUpload(req, res, (err) => {
    if (err) return next(err);
    brandAttachPath(req, res, next);
  });
};

// Public view
router.get("/", getAll);
router.get("/:id", get);

// Protected write
router.post(
  "/",
  authMiddleware,
  adminOrSuperAdmin,
  withBrandUpload,
  joiValidator(createValidation),
  create
);

router.put(
  "/:id",
  authMiddleware,
  adminOrSuperAdmin,
  withBrandUpload,
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
