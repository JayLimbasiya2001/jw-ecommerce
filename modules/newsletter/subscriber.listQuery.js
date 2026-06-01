"use strict";

const { Op } = require("sequelize");
const {
  parseListQuery,
  searchWhere,
  coerceBoolQuery,
} = require("../../middleware/listPagination");

const SORTABLE = ["id", "email", "subscribed_at", "created_at"];

function parseSubscriberListQuery(query = {}) {
  const { page, limit, offset, order } = parseListQuery(query, {
    defaultSortBy: "id",
    sortable: SORTABLE,
    defaultSortOrder: "desc",
  });

  const where = {};
  const isActive = coerceBoolQuery(query.isActive);
  if (isActive !== undefined) where.isActive = isActive;

  const searchPart = searchWhere(query.search ?? query.q, ["email", "name"]);
  if (searchPart[Op.or]) {
    Object.assign(where, searchPart);
  }

  return { where, order, limit, offset, page };
}

module.exports = { parseSubscriberListQuery };
