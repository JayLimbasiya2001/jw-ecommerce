
"use strict";

const { adminModule } = require("../../middleware/adminAccess");
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

const withBrandUpload = (req, res, next) => {
  const isMultipart = (req.get("content-type") || "").includes("multipart/form-data");
  if (!isMultipart) return next();

  brandUpload(req, res, (err) => {
    if (err) return next(err);
    brandAttachPath(req, res, next);
  });
};

router.get("/", getAll);
router.get("/:id", get);

router.post(
  "/",
  ...adminModule("brands"),
  withBrandUpload,
  joiValidator(createValidation),
  create
);

router.put(
  "/:id",
  ...adminModule("brands"),
  withBrandUpload,
  joiValidator(updateValidation),
  update
);

router.delete("/:id", ...adminModule("brands"), remove);

module.exports = router;
