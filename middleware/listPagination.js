"use strict";

const { Op } = require("sequelize");

/**
 * @param {object} query - req.query
 * @param {{ defaultLimit?: number, maxLimit?: number, defaultSortBy?: string, sortable?: string[], defaultSortOrder?: string }} options
 */
function parseListQuery(query = {}, options = {}) {
  const {
    defaultLimit = 20,
    maxLimit = 100,
    defaultSortBy = "id",
    sortable = ["id", "created_at", "updated_at"],
    defaultSortOrder = "desc",
  } = options;

  const sortableSet = new Set(sortable);
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(query.limit, 10) || defaultLimit, 1),
    maxLimit
  );
  const offset = (page - 1) * limit;

  const sortBy = sortableSet.has(String(query.sortBy || "").trim())
    ? String(query.sortBy).trim()
    : defaultSortBy;
  const dir =
    String(query.sortOrder || defaultSortOrder).toLowerCase() === "asc"
      ? "ASC"
      : "DESC";
  const order = [[sortBy, dir]];

  return { page, limit, offset, order };
}

function buildPaginatedResponse(data, page, limit, message) {
  const count = typeof data?.count === "number" ? data.count : 0;
  const rows = data?.rows ?? [];
  const totalPages = limit > 0 ? Math.max(0, Math.ceil(count / limit)) : 0;

  return {
    status: 200,
    message,
    data: {
      count,
      currentPage: page,
      totalPages,
      rows,
    },
  };
}

/** ILIKE search on multiple columns */
function searchWhere(term, fields) {
  if (term == null || String(term).trim() === "") return {};
  const pattern = `%${String(term).trim()}%`;
  return {
    [Op.or]: fields.map((field) => ({ [field]: { [Op.iLike]: pattern } })),
  };
}

function coerceBoolQuery(val) {
  if (val === undefined || val === "") return undefined;
  if (val === true || val === "true" || val === 1 || val === "1") return true;
  if (val === false || val === "false" || val === 0 || val === "0") return false;
  return undefined;
}

module.exports = {
  parseListQuery,
  buildPaginatedResponse,
  searchWhere,
  coerceBoolQuery,
};
