
"use strict";

const { adminModule } = require("../../middleware/adminAccess");
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

const withCategoryUpload = (req, res, next) => {
  const isMultipart = (req.get("content-type") || "").includes("multipart/form-data");
  if (!isMultipart) return next();

  categoryUpload(req, res, (err) => {
    if (err) return next(err);
    categoryAttachPath(req, res, next);
  });
};

router.get("/", getAll);
router.get("/:id", get);

router.post(
  "/",
  ...adminModule("categories"),
  withCategoryUpload,
  joiValidator(createValidation),
  create
);

router.put(
  "/:id",
  ...adminModule("categories"),
  withCategoryUpload,
  joiValidator(updateValidation),
  update
);

router.delete("/:id", ...adminModule("categories"), remove);

module.exports = router;
