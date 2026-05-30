"use strict";

const { adminModule } = require("../../middleware/adminAccess");
const { joiValidator } = require("../../middleware/joiValidator");
const { blogUpload, blogAttachPath } = require("../../middleware/upload");
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

const withBlogUpload = (req, res, next) => {
  const isMultipart = (req.get("content-type") || "").includes("multipart/form-data");
  if (!isMultipart) return next();
  blogUpload(req, res, (err) => {
    if (err) return next(err);
    blogAttachPath(req, res, next);
  });
};

router.get("/", getAll);
router.get("/:id", get);

router.post(
  "/",
  ...adminModule("blog"),
  withBlogUpload,
  joiValidator(createValidation),
  create
);

router.patch(
  "/:id",
  ...adminModule("blog"),
  withBlogUpload,
  joiValidator(updateValidation),
  update
);

router.delete("/:id", ...adminModule("blog"), remove);

module.exports = router;
