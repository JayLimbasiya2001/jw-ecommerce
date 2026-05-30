
"use strict";

const { adminModule } = require("../../middleware/adminAccess");
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

router.get("/", getAll);
router.get("/:id", get);

router.post(
  "/",
  ...adminModule("hero_sliders"),
  withUpload,
  joiValidator(createValidation),
  create
);
router.patch(
  "/:id",
  ...adminModule("hero_sliders"),
  withUpload,
  joiValidator(updateValidation),
  update
);
router.delete("/:id", ...adminModule("hero_sliders"), remove);

module.exports = router;
