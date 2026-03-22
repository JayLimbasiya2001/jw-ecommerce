
"use strict";

const { authMiddleware } = require("../../middleware/auth");
const { requireRole } = require("../../middleware/requireRole");
const { joiValidator } = require("../../middleware/joiValidator");
const { categoryUpload, categoryAttachPath } = require("../../middleware/upload");
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

// Roles allowed to manage categories
const adminOrSuperAdmin = requireRole(["superAdmin", "admin"]);

// Run multer only for multipart/form-data; otherwise just continue (JSON body)
const withCategoryUpload = (req, res, next) => {
  const isMultipart = (req.get("content-type") || "").includes("multipart/form-data");
  if (!isMultipart) return next();

  categoryUpload(req, res, (err) => {
    if (err) return next(err);
    categoryAttachPath(req, res, next);
  });
};

// Public: anyone can view categories
router.get("/", getAll);
router.get("/:id", get);

// Protected: only superAdmin and admin can create, update, delete
router.post(
  "/",
  authMiddleware,
  adminOrSuperAdmin,
  withCategoryUpload,
  joiValidator(createValidation),
  create
);

router.put(
  "/:id",
  authMiddleware,
  adminOrSuperAdmin,
  withCategoryUpload,
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
