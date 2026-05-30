"use strict";

const { Op } = require("sequelize");
const {
  parseListQuery,
  searchWhere,
  coerceBoolQuery,
} = require("../../middleware/listPagination");

const SORTABLE = ["id", "title", "created_at", "updated_at", "published_at", "viewCount"];

function parseBlogListQuery(query = {}) {
  const { page, limit, offset, order } = parseListQuery(query, {
    defaultSortBy: "id",
    sortable: SORTABLE,
    defaultSortOrder: "desc",
  });

  const where = {};

  if (query.status != null && String(query.status).trim() !== "") {
    where.status = String(query.status).trim();
  }
  if (query.category != null && String(query.category).trim() !== "") {
    where.category = String(query.category).trim();
  }
  const isFeatured = coerceBoolQuery(query.isFeatured);
  if (isFeatured !== undefined) where.isFeatured = isFeatured;

  const search = query.search ?? query.q ?? query.title;
  const searchPart = searchWhere(search, ["title", "slug", "excerpt", "content"]);
  if (searchPart[Op.or]) {
    Object.assign(where, searchPart);
  }

  return { where, order, limit, offset, page };
}

module.exports = { parseBlogListQuery };
