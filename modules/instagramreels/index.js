"use strict";

const { adminModule } = require("../../middleware/adminAccess");
const { joiValidator } = require("../../middleware/joiValidator");
const {
  instagramReelsUpload,
  instagramReelsAttachPath,
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

const withReelUpload = (req, res, next) => {
  const isMultipart = (req.get("content-type") || "").includes("multipart/form-data");
  if (!isMultipart) return next();
  instagramReelsUpload(req, res, (err) => {
    if (err) return next(err);
    instagramReelsAttachPath(req, res, next);
  });
};

router.get("/", getAll);
router.get("/:id", get);

router.post(
  "/",
  ...adminModule("instagram_reels"),
  withReelUpload,
  joiValidator(createValidation),
  create
);

router.patch(
  "/:id",
  ...adminModule("instagram_reels"),
  withReelUpload,
  joiValidator(updateValidation),
  update
);

router.delete("/:id", ...adminModule("instagram_reels"), remove);

module.exports = router;
