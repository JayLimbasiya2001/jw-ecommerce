"use strict";

const path = require("path");

const root = path.join(__dirname, "..");

/** Load all Sequelize models and associations (order respects FK dependencies). */
function loadModels() {
  const files = [
    "modules/user/model",
    "modules/customer/model",
    "modules/category/model",
    "modules/brand/model",
    "modules/attribute/model",
    "modules/attributevalue/model",
    "modules/variantattribute/model",
    "modules/product/model",
    "modules/productvariant/model",
    "modules/productimage/model",
    "modules/adminpermission/model",
    "modules/address/model",
    "modules/cart/model",
    "modules/orders/model",
    "modules/orderitems/model",
    "modules/wishlist/model",
    "modules/reviews/model",
    "modules/coupon/model",
    "modules/newsletter/model",
    "modules/heroslider/model",
    "modules/instagramreels/model",
    "modules/blog/model",
    "modules/sitesetting/model",
    "modules/paymentgateway/model",
  ];

  files.forEach((rel) => {
    require(path.join(root, rel));
  });
}

module.exports = { loadModels };
