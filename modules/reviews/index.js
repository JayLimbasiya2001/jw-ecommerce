"use strict";

const { authMiddleware } = require("../../middleware/auth");
const { requireCustomer } = require("../../middleware/requireCustomer");
const { requireStaff } = require("../../middleware/requireStaff");
const { refreshStaffModules } = require("../../middleware/refreshStaffModules");
const { requireModule } = require("../../middleware/requireModule");
const { joiValidator } = require("../../middleware/joiValidator");
const {
  create,
  getAll,
  getByProduct,
  update,
  get,
  remove,
  approve,
} = require("./controller");
const { createValidation, updateValidation } = require("./joiSchema");

const router = require("express").Router();

const adminReviews = [
  authMiddleware,
  requireStaff,
  refreshStaffModules,
  requireModule("reviews"),
];

/** Public approved reviews by product */
router.get("/product/:productId", getByProduct);

/** Public list (approved only) or staff list with filters */
router.get("/", (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authMiddleware(req, res, () => {
      if (req.user?.accountType === "staff") {
        return requireStaff(req, res, () =>
          refreshStaffModules(req, res, () =>
            requireModule("reviews")(req, res, () => getAll(req, res, next))
          )
        );
      }
      return getAll(req, res, next);
    });
  }
  req.user = undefined;
  return getAll(req, res, next);
});

router.get("/:id", (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authMiddleware(req, res, () => get(req, res, next));
  }
  req.user = undefined;
  return get(req, res, next);
});

router.post(
  "/",
  authMiddleware,
  requireCustomer,
  joiValidator(createValidation),
  create
);

router.patch("/:id", ...adminReviews, joiValidator(updateValidation), update);
router.patch("/:id/approve", ...adminReviews, approve);
router.delete("/:id", ...adminReviews, remove);

module.exports = router;
