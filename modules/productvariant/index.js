
"use strict";

const { adminModule } = require("../../middleware/adminAccess");
const { joiValidator } = require("../../middleware/joiValidator");
const {
  productVariantUpload,
  productVariantAttachPath,
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

const withVariantUpload = (req, res, next) => {
  const isMultipart = (req.get("content-type") || "").includes("multipart/form-data");
  if (!isMultipart) return next();

  productVariantUpload(req, res, (err) => {
    if (err) return next(err);
    productVariantAttachPath(req, res, next);
  });
};

router.get("/", getAll);
router.get("/:id", get);

router.post(
  "/",
  ...adminModule("product_variants"),
  withVariantUpload,
  joiValidator(createValidation),
  create
);

router.patch(
  "/:id",
  ...adminModule("product_variants"),
  withVariantUpload,
  joiValidator(updateValidation),
  update
);

router.delete("/:id", ...adminModule("product_variants"), remove);

module.exports = router;
