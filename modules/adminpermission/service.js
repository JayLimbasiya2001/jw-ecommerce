"use strict";

const { Op } = require("sequelize");
const Model = require("./model");
const { allModuleKeys, isValidModuleKey } = require("../../config/adminModules");

exports.AdminPermissionService = {
  async getModuleKeysForUser(userId, role) {
    const r = String(role || "").toLowerCase();
    if (r === "superadmin") return allModuleKeys();
    const rows = await Model.findAll({
      where: { userId },
      attributes: ["moduleKey"],
    });
    return rows.map((x) => x.moduleKey);
  },

  async setPermissionsForAdmin(userId, moduleKeys, grantedBy) {
    const keys = [...new Set((moduleKeys || []).map((k) => String(k).trim()))].filter(
      isValidModuleKey
    );
    await Model.destroy({ where: { userId } });
    if (!keys.length) return [];
    await Model.bulkCreate(
      keys.map((moduleKey) => ({ userId, moduleKey, grantedBy }))
    );
    return keys;
  },

  async findByUserId(userId) {
    return Model.findAll({
      where: { userId },
      order: [["moduleKey", "ASC"]],
    });
  },

  async hasModule(userId, role, moduleKey) {
    const r = String(role || "").toLowerCase();
    if (r === "superadmin") return true;
    if (r !== "admin") return false;
    const count = await Model.count({
      where: { userId, moduleKey: String(moduleKey).trim() },
    });
    return count > 0;
  },
};
