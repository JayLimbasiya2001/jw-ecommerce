"use strict";

const { adminModule } = require("../../middleware/adminAccess");
const { joiValidator } = require("../../middleware/joiValidator");
const controller = require("./controller");
const { submitValidation } = require("./joiSchema");

const router = require("express").Router();

router.post("/", joiValidator(submitValidation), controller.submit);
router.get("/", ...adminModule("sitesettings"), controller.getAll);
router.get("/:id", ...adminModule("sitesettings"), controller.get);

module.exports = router;
