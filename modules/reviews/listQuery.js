"use strict";

const { Op } = require("sequelize");
const {
  parseListQuery,
  searchWhere,
  coerceBoolQuery,
  parseIdListQuery,
  parseIntRangeQuery,
} = require("../../middleware/listPagination");

const SORTABLE = ["id", "rating", "created_at", "updated_at"];

function parseReviewListQuery(query = {}, { publicOnly = false } = {}) {
  const { page, limit, offset, order } = parseListQuery(query, {
    defaultSortBy: "id",
    sortable: SORTABLE,
    defaultSortOrder: "desc",
  });

  const where = {};
  if (publicOnly) {
    where.isApproved = true;
  } else {
    const isApproved = coerceBoolQuery(query.isApproved);
    if (isApproved !== undefined) where.isApproved = isApproved;
  }

  const isVerified = coerceBoolQuery(query.isVerifiedPurchase);
  if (isVerified !== undefined) where.isVerifiedPurchase = isVerified;

  const productIds = parseIdListQuery(query.productId ?? query.productIds);
  if (productIds) {
    where.productId = productIds.length === 1 ? productIds[0] : { [Op.in]: productIds };
  }

  const customerIds = parseIdListQuery(query.customerId ?? query.customerIds);
  if (customerIds) {
    where.customerId = customerIds.length === 1 ? customerIds[0] : { [Op.in]: customerIds };
  }

  const ratingRange = parseIntRangeQuery(query, "rating", { minKey: "minRating", maxKey: "maxRating" });
  if (ratingRange) where.rating = ratingRange;

  const searchPart = searchWhere(query.search ?? query.q, ["title", "comment"]);
  if (searchPart[Op.or]) Object.assign(where, searchPart);

  return { where, order, limit, offset, page };
}

module.exports = { parseReviewListQuery };
