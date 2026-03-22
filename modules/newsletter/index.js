"use strict";

const { authMiddleware } = require("../../middleware/auth");
const { joiValidator } = require("../../middleware/joiValidator");
const {
  create,
  getAll,
  update,
  get,
  remove
} = require("./controller");
const {
  createValidation,
  updateValidation
} = require("./joiSchema");

const router = require("express").Router();

// You may want to keep subscribe public; protect listing with auth
router.post("/", joiValidator(createValidation), create);

router.use(authMiddleware);

router
  .route("/")
  .get(getAll);

router
  .route("/:id")
  .patch(joiValidator(updateValidation), update)
  .get(get)
  .delete(remove);

module.exports = router;

