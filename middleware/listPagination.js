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

/**
 * Parse comma-separated or repeated query params into integer IDs.
 * Supports: categoryIds=1,2,3 | categoryId=1&categoryId=2 | categoryIds[]=1
 */
function parseIdListQuery(val) {
  if (val == null || val === "") return null;
  const raw = Array.isArray(val) ? val : String(val).split(",");
  const ids = raw
    .map((v) => parseInt(String(v).trim(), 10))
    .filter((n) => !Number.isNaN(n) && n > 0);
  return ids.length ? [...new Set(ids)] : null;
}

/** Apply min/max integer range filters from query keys minX / maxX */
function parseIntRangeQuery(query, field, { minKey, maxKey } = {}) {
  const minK = minKey || `min${field.charAt(0).toUpperCase()}${field.slice(1)}`;
  const maxK = maxKey || `max${field.charAt(0).toUpperCase()}${field.slice(1)}`;
  let min;
  let max;
  if (query[minK] != null && query[minK] !== "") {
    const n = parseInt(query[minK], 10);
    if (!Number.isNaN(n)) min = n;
  }
  if (query[maxK] != null && query[maxK] !== "") {
    const n = parseInt(query[maxK], 10);
    if (!Number.isNaN(n)) max = n;
  }
  if (min === undefined && max === undefined) return null;
  const bounds = {};
  if (min !== undefined) bounds[Op.gte] = min;
  if (max !== undefined) bounds[Op.lte] = max;
  return bounds;
}

function parseDateRangeQuery(query, field = "created_at") {
  const fromKey = `${field}From`;
  const toKey = `${field}To`;
  const from = query[fromKey] || query.dateFrom;
  const to = query[toKey] || query.dateTo;
  if (!from && !to) return null;
  const range = {};
  if (from) range[Op.gte] = new Date(from);
  if (to) range[Op.lte] = new Date(to);
  return range;
}

module.exports = {
  parseListQuery,
  buildPaginatedResponse,
  searchWhere,
  coerceBoolQuery,
  parseIdListQuery,
  parseIntRangeQuery,
  parseDateRangeQuery,
};
