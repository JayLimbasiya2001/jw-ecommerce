"use strict";

const { Op } = require("sequelize");
const {
  parseListQuery,
  searchWhere,
  coerceBoolQuery,
} = require("../../middleware/listPagination");

const SORTABLE = [
  "id",
  "couponCode",
  "discountValue",
  "usageCount",
  "created_at",
  "updated_at",
  "validUntil",
];

function parseCouponListQuery(query = {}) {
  const { page, limit, offset, order } = parseListQuery(query, {
    defaultSortBy: "id",
    sortable: SORTABLE,
    defaultSortOrder: "desc",
  });

  const where = {};
  const isActive = coerceBoolQuery(query.isActive);
  if (isActive !== undefined) where.isActive = isActive;

  if (query.discountType != null && String(query.discountType).trim() !== "") {
    const t = String(query.discountType).trim().toLowerCase();
    if (t === "percentage" || t === "fixed") where.discountType = t;
  }

  const searchPart = searchWhere(query.search ?? query.q ?? query.code, [
    "couponCode",
    "description",
  ]);
  if (searchPart[Op.or]) {
    Object.assign(where, searchPart);
  }

  return { where, order, limit, offset, page };
}

module.exports = { parseCouponListQuery };
