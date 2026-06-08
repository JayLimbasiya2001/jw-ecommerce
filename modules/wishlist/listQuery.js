"use strict";

const {
  parseListQuery,
  parseIdListQuery,
} = require("../../middleware/listPagination");
const { Op } = require("sequelize");

const SORTABLE = ["id", "created_at", "updated_at"];

function parseWishlistListQuery(query = {}, { customerId } = {}) {
  const { page, limit, offset, order } = parseListQuery(query, {
    defaultSortBy: "id",
    sortable: SORTABLE,
    defaultSortOrder: "desc",
  });

  const where = {};
  if (customerId != null) where.customerId = customerId;

  const productIds = parseIdListQuery(query.productId ?? query.productIds);
  if (productIds) {
    where.productId = productIds.length === 1 ? productIds[0] : { [Op.in]: productIds };
  }

  return { where, order, limit, offset, page };
}

module.exports = { parseWishlistListQuery };
