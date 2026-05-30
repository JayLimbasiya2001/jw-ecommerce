"use strict";

const { Op } = require("sequelize");
const {
  parseListQuery,
  searchWhere,
  coerceBoolQuery,
} = require("../../middleware/listPagination");

const SORTABLE = ["id", "rank", "likes", "views", "created_at", "updated_at"];

/** Map API sortBy → DB column (underscored schema). */
const SORT_FIELD_MAP = {
  id: "id",
  rank: "rank",
  likes: "likes",
  views: "views",
  created_at: "created_at",
  updated_at: "updated_at",
  createdAt: "created_at",
  updatedAt: "updated_at",
};

function parseReelsListQuery(query = {}) {
  const parsed = parseListQuery(query, {
    defaultSortBy: "rank",
    sortable: SORTABLE,
    defaultSortOrder: "asc",
  });

  const sortKey = String(query.sortBy || "rank").trim();
  const dbSort = SORT_FIELD_MAP[sortKey] || SORT_FIELD_MAP.rank;
  const dir =
    String(query.sortOrder || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";
  const order = [[dbSort, dir]];

  const where = {};
  const isActive = coerceBoolQuery(query.isActive);
  if (isActive !== undefined) where.isActive = isActive;

  const searchPart = searchWhere(query.search ?? query.q, ["caption", "video"]);
  if (searchPart[Op.or]) {
    Object.assign(where, searchPart);
  }

  return {
    where,
    order,
    limit: parsed.limit,
    offset: parsed.offset,
    page: parsed.page,
  };
}

module.exports = { parseReelsListQuery, SORTABLE };
