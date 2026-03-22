
"use strict";

const { authMiddleware } = require("../../middleware/auth");
const { requireRole } = require("../../middleware/requireRole");
const { joiValidator } = require("../../middleware/joiValidator");
const { heroSliderUpload, heroSliderAttachPaths } = require("../../middleware/upload");
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

// Only superAdmin and admin can create, update, delete
const adminOrSuperAdmin = requireRole(["superAdmin", "admin"]);

// Run multer for multipart so req.body gets form fields
const withUpload = (req, res, next) => {
  const isMultipart = (req.get("content-type") || "").includes("multipart/form-data");
  if (isMultipart) {
    heroSliderUpload(req, res, (err) => {
      if (err) return next(err);
      heroSliderAttachPaths(req, res, next);
    });
  } else {
    next();
  }
};

// Public: anyone can view (no login required)
router.get("/", getAll);
router.get("/:id", get);

// Protected: only superAdmin and admin can upload, edit, delete
router.post(
  "/",
  authMiddleware,
  adminOrSuperAdmin,
  withUpload,
  joiValidator(createValidation),
  create
);
router.patch(
  "/:id",
  authMiddleware,
  adminOrSuperAdmin,
  withUpload,
  joiValidator(updateValidation),
  update
);
router.delete("/:id", authMiddleware, adminOrSuperAdmin, remove);

module.exports = router;
