"use strict";

const { adminModule } = require("../../middleware/adminAccess");
const { joiValidator } = require("../../middleware/joiValidator");
const { getAll, get } = require("./controller");
const router = require("express").Router();

/** Line items are created at checkout; staff can list/view via orders module */
router.get("/", ...adminModule("orders"), getAll);
router.get("/:id", ...adminModule("orders"), get);

module.exports = router;
