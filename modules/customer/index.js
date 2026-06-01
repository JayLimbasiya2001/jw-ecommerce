"use strict";

const { authMiddleware } = require("../../middleware/auth");
const { requireStaff } = require("../../middleware/requireStaff");
const { refreshStaffModules } = require("../../middleware/refreshStaffModules");
const { requireModule } = require("../../middleware/requireModule");
const { adminModule } = require("../../middleware/adminAccess");
const { joiValidator } = require("../../middleware/joiValidator");
const { customerUpload, customerAttachPath } = require("../../middleware/upload");
const { customerSelfOrStaffCustomers, customerSelfOnly } = require("./access");
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

const withCustomerUpload = (req, res, next) => {
  const isMultipart = (req.get("content-type") || "").includes("multipart/form-data");
  if (!isMultipart) return next();
  customerUpload(req, res, (err) => {
    if (err) return next(err);
    customerAttachPath(req, res, next);
  });
};

/** If Bearer token present, require staff + customers module; else public register. */
function optionalAdminCustomers(req, res, next) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return next();
  return authMiddleware(req, res, () =>
    requireStaff(req, res, () =>
      refreshStaffModules(req, res, () =>
        requireModule("customers")(req, res, next)
      )
    )
  );
}

router.post(
  "/",
  withCustomerUpload,
  optionalAdminCustomers,
  joiValidator(createValidation),
  create
);

router.get("/", ...adminModule("customers"), getAll);
router.get("/:id", ...adminModule("customers"), get);

/** Logged-in customer updates or deletes own account */
router.patch(
  "/me",
  ...customerSelfOnly,
  withCustomerUpload,
  joiValidator(updateValidation),
  update
);
router.delete("/me", ...customerSelfOnly, remove);

router.patch(
  "/:id",
  customerSelfOrStaffCustomers,
  withCustomerUpload,
  joiValidator(updateValidation),
  update
);
router.delete("/:id", customerSelfOrStaffCustomers, remove);

module.exports = router;
