"use strict";

const { Op } = require("sequelize");
const {
  parseListQuery,
  searchWhere,
} = require("../../middleware/listPagination");

const SORTABLE = ["id", "title", "created_at", "updated_at", "published_at"];

function parseNewsletterPostListQuery(query = {}, { publicOnly = false } = {}) {
  const { page, limit, offset, order } = parseListQuery(query, {
    defaultSortBy: "id",
    sortable: SORTABLE,
    defaultSortOrder: "desc",
  });

  const where = {};
  if (publicOnly) {
    where.status = "published";
  } else if (query.status != null && String(query.status).trim() !== "") {
    where.status = String(query.status).trim();
  }

  const searchPart = searchWhere(query.search ?? query.q, ["title", "slug", "excerpt", "content"]);
  if (searchPart[Op.or]) {
    Object.assign(where, searchPart);
  }

  return { where, order, limit, offset, page };
}

module.exports = { parseNewsletterPostListQuery };
