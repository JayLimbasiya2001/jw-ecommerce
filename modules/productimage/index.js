
"use strict";

const { adminModule } = require("../../middleware/adminAccess");
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
  ...adminModule("product_images"),
  withProductImageUpload,
  joiValidator(createValidation),
  create
);

router.patch(
  "/:id",
  ...adminModule("product_images"),
  withProductImageUpload,
  joiValidator(updateValidation),
  update
);

router.delete("/:id", ...adminModule("product_images"), remove);

module.exports = router;
