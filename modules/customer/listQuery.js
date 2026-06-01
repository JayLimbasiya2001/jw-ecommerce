"use strict";

const { Op } = require("sequelize");
const {
  parseListQuery,
  searchWhere,
  coerceBoolQuery,
} = require("../../middleware/listPagination");

const SORTABLE = ["id", "name", "email", "created_at", "updated_at"];

function parseCustomerListQuery(query = {}) {
  const { page, limit, offset, order } = parseListQuery(query, {
    defaultSortBy: "id",
    sortable: SORTABLE,
    defaultSortOrder: "desc",
  });

  const where = {};
  const isVerified = coerceBoolQuery(query.isVerified);
  if (isVerified !== undefined) where.isVerified = isVerified;

  const searchPart = searchWhere(query.search ?? query.q, ["name", "email", "phone"]);
  if (searchPart[Op.or]) {
    Object.assign(where, searchPart);
  }

  return { where, order, limit, offset, page };
}

module.exports = { parseCustomerListQuery };
