
"use strict";

const { authMiddleware } = require("../../middleware/auth");
const { requireRole } = require("../../middleware/requireRole");
const { joiValidator } = require("../../middleware/joiValidator");
const {
  productImageUpload,
  productImageAttachPaths,
} = require("../../middleware/upload");
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

const withProductImageUpload = (req, res, next) => {
  const isMultipart = (req.get("content-type") || "").includes("multipart/form-data");
  if (!isMultipart) return next();

  productImageUpload(req, res, (err) => {
    if (err) return next(err);
    productImageAttachPaths(req, res, next);
  });
};

router.get("/", getAll);
router.get("/:id", get);

router.post(
  "/",
  authMiddleware,
  adminOrSuperAdmin,
  withProductImageUpload,
  joiValidator(createValidation),
  create
);

router.patch(
  "/:id",
  authMiddleware,
  adminOrSuperAdmin,
  withProductImageUpload,
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
