"use strict";

const { Op } = require("sequelize");
const {
  parseListQuery,
  searchWhere,
  coerceBoolQuery,
} = require("../../middleware/listPagination");

const SORTABLE = ["id", "created_at", "updated_at", "rank"];

function parseAddressListQuery(query = {}, { customerId } = {}) {
  const { page, limit, offset, order } = parseListQuery(query, {
    defaultSortBy: "id",
    sortable: SORTABLE,
    defaultSortOrder: "desc",
  });

  const where = {};
  if (customerId != null) where.customerId = customerId;

  if (query.address_type != null && String(query.address_type).trim() !== "") {
    where.address_type = String(query.address_type).trim();
  }

  const searchPart = searchWhere(query.search ?? query.q, [
    "name",
    "phone",
    "address_line1",
    "city",
    "state",
    "country",
  ]);
  if (searchPart[Op.or]) Object.assign(where, searchPart);

  return { where, order, limit, offset, page };
}

module.exports = { parseAddressListQuery };
