"use strict";

const { Op } = require("sequelize");
const {
  parseListQuery,
  searchWhere,
  coerceBoolQuery,
  parseIntRangeQuery,
} = require("../../middleware/listPagination");

const SORTABLE = ["id", "name", "rank", "created_at", "updated_at"];

function parseCategoryListQuery(query = {}) {
  const { page, limit, offset, order } = parseListQuery(query, {
    defaultSortBy: "rank",
    sortable: SORTABLE,
    defaultSortOrder: "asc",
  });

  const where = {};
  const isActive = coerceBoolQuery(query.isActive);
  if (isActive !== undefined) where.isActive = isActive;

  const rankRange = parseIntRangeQuery(query, "rank", { minKey: "minRank", maxKey: "maxRank" });
  if (rankRange) where.rank = rankRange;

  const searchPart = searchWhere(query.search ?? query.q, ["name", "slug", "description"]);
  if (searchPart[Op.or]) Object.assign(where, searchPart);

  return { where, order, limit, offset, page };
}

module.exports = { parseCategoryListQuery };
