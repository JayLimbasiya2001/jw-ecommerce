"use strict";

const { Op } = require("sequelize");
const {
  parseListQuery,
  searchWhere,
  parseIdListQuery,
  parseIntRangeQuery,
  parseDateRangeQuery,
} = require("../../middleware/listPagination");

const SORTABLE = ["id", "created_at", "updated_at", "totalAmount", "orderStatus"];

function parseStringList(val) {
  if (val == null || val === "") return null;
  const raw = Array.isArray(val) ? val : String(val).split(",");
  const items = raw.map((v) => String(v).trim()).filter(Boolean);
  return items.length ? [...new Set(items)] : null;
}

function parseOrderListQuery(query = {}, { customerId } = {}) {
  const { page, limit, offset, order } = parseListQuery(query, {
    defaultSortBy: "id",
    sortable: SORTABLE,
    defaultSortOrder: "desc",
  });

  const where = {};
  if (customerId != null) {
    where.customerId = customerId;
  }

  const customerIds = parseIdListQuery(query.customerId ?? query.customerIds);
  if (customerIds && customerId == null) {
    where.customerId =
      customerIds.length === 1 ? customerIds[0] : { [Op.in]: customerIds };
  }

  const orderStatuses = parseStringList(query.orderStatuses ?? query.orderStatus);
  if (orderStatuses) {
    where.orderStatus =
      orderStatuses.length === 1 ? orderStatuses[0] : { [Op.in]: orderStatuses };
  }

  if (query.paymentStatus != null && String(query.paymentStatus).trim() !== "") {
    where.paymentStatus = String(query.paymentStatus).trim();
  }
  if (query.paymentMethod != null && String(query.paymentMethod).trim() !== "") {
    where.paymentMethod = String(query.paymentMethod).trim();
  }

  const totalRange = parseIntRangeQuery(query, "totalAmount", {
    minKey: "minTotal",
    maxKey: "maxTotal",
  });
  if (totalRange) where.totalAmount = totalRange;

  const dateRange = parseDateRangeQuery(query, "created_at");
  if (dateRange) where.created_at = dateRange;

  const searchPart = searchWhere(query.search ?? query.q, [
    "orderStatus",
    "paymentStatus",
    "transactionId",
    "paymentMethod",
  ]);
  if (searchPart[Op.or]) {
    Object.assign(where, searchPart);
  }

  return { where, order, limit, offset, page };
}

module.exports = { parseOrderListQuery };
