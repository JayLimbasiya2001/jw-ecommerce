"use strict";

/**
 * Admin panel modules. Super admin has all keys; admin users get a subset via admin_permissions.
 */
const ADMIN_MODULES = [
  { key: "products", name: "Product Management" },
  { key: "product_variants", name: "Product Variants" },
  { key: "product_images", name: "Product Images" },
  { key: "categories", name: "Category Management" },
  { key: "brands", name: "Brand Management" },
  { key: "attributes", name: "Attributes" },
  { key: "hero_sliders", name: "Hero Slider" },
  { key: "instagram_reels", name: "Instagram Reels" },
  { key: "newsletter", name: "Newsletter Management" },
  { key: "orders", name: "Order Management" },
  { key: "coupons", name: "Coupon Management" },
  { key: "blog", name: "Blog Management" },
  { key: "reviews", name: "Reviews Management" },
  { key: "sitesettings", name: "Site Settings" },
  { key: "users", name: "Staff & Permissions" },
];

const MODULE_KEYS = new Set(ADMIN_MODULES.map((m) => m.key));

function isValidModuleKey(key) {
  return MODULE_KEYS.has(String(key || "").trim());
}

function allModuleKeys() {
  return ADMIN_MODULES.map((m) => m.key);
}

module.exports = {
  ADMIN_MODULES,
  MODULE_KEYS,
  isValidModuleKey,
  allModuleKeys,
};
