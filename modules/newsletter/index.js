"use strict";

const { adminModule } = require("../../middleware/adminAccess");
const { joiValidator } = require("../../middleware/joiValidator");
const {
  newsletterPostUpload,
  newsletterPostAttachPath,
} = require("../../middleware/upload");
const postController = require("./post.controller");
const subscriberController = require("./subscriber.controller");
const { createValidation, updateValidation } = require("./post.joiSchema");
const { subscribeValidation } = require("./subscriber.joiSchema");

const router = require("express").Router();

const withNewsletterUpload = (req, res, next) => {
  const isMultipart = (req.get("content-type") || "").includes("multipart/form-data");
  if (!isMultipart) return next();
  newsletterPostUpload(req, res, (err) => {
    if (err) return next(err);
    newsletterPostAttachPath(req, res, next);
  });
};

/** Public email signup */
router.post("/subscribe", joiValidator(subscribeValidation), subscriberController.subscribe);

/** Admin — subscriber list */
router.get("/subscribers", ...adminModule("newsletter"), subscriberController.getAll);
router.get("/subscribers/:id", ...adminModule("newsletter"), subscriberController.get);
router.delete("/subscribers/:id", ...adminModule("newsletter"), subscriberController.remove);

/** Newsletter posts — public read (published only); write requires admin */
router.get("/", postController.getAll);
router.get("/:id", postController.get);

router.post(
  "/",
  ...adminModule("newsletter"),
  withNewsletterUpload,
  joiValidator(createValidation),
  postController.create
);
router.patch(
  "/:id",
  ...adminModule("newsletter"),
  withNewsletterUpload,
  joiValidator(updateValidation),
  postController.update
);
router.delete("/:id", ...adminModule("newsletter"), postController.remove);

module.exports = router;
