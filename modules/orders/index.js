"use strict";

const { authMiddleware } = require("../../middleware/auth");
const { requireCustomer } = require("../../middleware/requireCustomer");
const { allowCustomerOrStaffModule } = require("../../middleware/allowCustomerOrStaffModule");
const { joiValidator } = require("../../middleware/joiValidator");
const { checkout, getAll, update, get, remove, cancel } = require("./controller");
const { checkoutValidation, updateValidation, cancelValidation } = require("./joiSchema");

const router = require("express").Router();

/** Customer checkout from cart */
router.post(
  "/checkout",
  authMiddleware,
  requireCustomer,
  joiValidator(checkoutValidation),
  checkout
);

router.use(authMiddleware, allowCustomerOrStaffModule("orders"));

router.get("/", getAll);
router.get("/:id", get);
router.post("/:id/cancel", joiValidator(cancelValidation), cancel);
router.patch("/:id", joiValidator(updateValidation), update);
router.delete("/:id", remove);

module.exports = router;
