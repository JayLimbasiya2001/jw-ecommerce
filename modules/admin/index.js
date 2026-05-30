"use strict";

const router = require("express").Router();
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const { authMiddleware } = require("../../middleware/auth");
const { requireStaff } = require("../../middleware/requireStaff");
const { superAdminOnly } = require("../../middleware/adminAccess");
const { refreshStaffModules } = require("../../middleware/refreshStaffModules");
const { ADMIN_MODULES, allModuleKeys } = require("../../config/adminModules");
const { AdminPermissionService } = require("../adminpermission/service");
const { UserService } = require("../user/service");
const { joiValidator } = require("../../middleware/joiValidator");

const validModuleKeys = allModuleKeys();

const setPermissionsSchema = Joi.object({
  moduleKeys: Joi.array()
    .items(Joi.string().valid(...validModuleKeys))
    .required()
    .messages({
      "any.required": "moduleKeys is required",
      "array.base": "moduleKeys must be an array",
      "any.only": "One or more moduleKeys are invalid",
    }),
});

const createStaffSchema = Joi.object({
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().trim().required(),
  phone: Joi.string().allow(null, "").optional(),
  role: Joi.string().valid("admin").required(),
  moduleKeys: Joi.array()
    .items(Joi.string().valid(...validModuleKeys))
    .optional(),
});

/** All panel module definitions (labels for UI). */
router.get("/modules", authMiddleware, requireStaff, (req, res) => {
  res.status(200).json({
    status: 200,
    data: ADMIN_MODULES,
  });
});

/** Modules the logged-in staff user may access (for sidebar). */
router.get(
  "/my-modules",
  authMiddleware,
  requireStaff,
  refreshStaffModules,
  (req, res) => {
    res.status(200).json({
      status: 200,
      data: {
        role: req.user.role,
        modules: req.user.modules || [],
      },
    });
  }
);

router.get(
  "/permissions/:userId",
  ...superAdminOnly(),
  async (req, res, next) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const user = await UserService.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ status: 404, message: "Staff user not found" });
      }
      const role = user.role;
      if (String(role).toLowerCase() === "superadmin") {
        return res.status(200).json({
          status: 200,
          data: {
            userId,
            role,
            moduleKeys: allModuleKeys(),
            permissions: [],
          },
        });
      }
      if (String(role).toLowerCase() !== "admin") {
        return res.status(400).json({
          status: 400,
          message: "Permissions apply only to admin users",
        });
      }
      const rows = await AdminPermissionService.findByUserId(userId);
      return res.status(200).json({
        status: 200,
        data: {
          userId,
          role,
          moduleKeys: rows.map((r) => r.moduleKey),
          permissions: rows,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

async function updateAdminPermissions(req, res, next) {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (Number.isNaN(userId)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid userId",
      });
    }

    const user = await UserService.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ status: 404, message: "Staff user not found" });
    }
    if (String(user.role).toLowerCase() === "superadmin") {
      return res.status(400).json({
        status: 400,
        message: "Super admin always has all modules",
      });
    }
    if (String(user.role).toLowerCase() !== "admin") {
      return res.status(400).json({
        status: 400,
        message: "Only admin users can receive module permissions",
      });
    }

    const moduleKeys = await AdminPermissionService.setPermissionsForAdmin(
      userId,
      req.body.moduleKeys,
      req.user.id
    );

    return res.status(200).json({
      status: 200,
      message: "Module access permissions updated successfully",
      data: { userId, moduleKeys },
    });
  } catch (err) {
    next(err);
  }
}

/** Update admin module access — super admin only. Replaces all modules for that admin. */
router.put(
  "/update/:userId",
  ...superAdminOnly(),
  joiValidator(setPermissionsSchema, {
    example: {
      moduleKeys: ["products", "categories", "newsletter"],
    },
  }),
  updateAdminPermissions
);

router.post(
  "/create",
  ...superAdminOnly(),
  joiValidator(createStaffSchema),
  async (req, res, next) => {
    try {
      const { email, password, name, phone, role, moduleKeys } = req.body;
      const existing = await UserService.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({
          status: "fail",
          message: "Email already registered as staff",
        });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await UserService.create({
        email,
        password: passwordHash,
        name,
        phone,
        role,
        isVerified: true,
      });
      if (Array.isArray(moduleKeys) && moduleKeys.length) {
        await AdminPermissionService.setPermissionsForAdmin(
          user.id,
          moduleKeys,
          req.user.id
        );
      }
      const plain = user.get({ plain: true });
      delete plain.password;
      const keys = await AdminPermissionService.getModuleKeysForUser(
        user.id,
        user.role
      );
      return res.status(201).json({
        status: 201,
        message: "Admin user created",
        data: { ...plain, moduleKeys: keys },
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
