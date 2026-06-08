"use strict";

const { AddressService } = require("./service");
const { parseAddressListQuery } = require("./listQuery");
const { buildPaginatedResponse } = require("../../middleware/listPagination");

async function findOwned(id, customerId) {
  return AddressService.findOne({ where: { id, customerId } });
}

exports.create = async (req, res, next) => {
  try {
    const data = await AddressService.create({
      ...req.body,
      customerId: req.user.id,
    });
    return res.status(201).json({ status: 201, message: "Address created", data });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { where, order, limit, offset, page } = parseAddressListQuery(req.query, {
      customerId: req.user.id,
    });
    const result = await AddressService.findAndCountAll({ where, order, limit, offset });
    const count = typeof result?.count === "number" ? result.count : 0;
    const body = buildPaginatedResponse(
      { count, rows: result?.rows ?? [] },
      page,
      limit,
      count === 0 ? "No addresses found" : "Addresses fetched successfully"
    );
    return res.status(200).json(body);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const data = await findOwned(req.params.id, req.user.id);
    if (!data) return res.status(404).json({ status: 404, message: "Address not found" });
    return res.status(200).json({ status: 200, data });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const [affected] = await AddressService.update(req.body, {
      where: { id: req.params.id, customerId: req.user.id },
    });
    if (!affected) return res.status(404).json({ status: 404, message: "Address not found" });
    const data = await findOwned(req.params.id, req.user.id);
    return res.status(200).json({ status: 200, message: "Address updated", data });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const deleted = await AddressService.remove({
      where: { id: req.params.id, customerId: req.user.id },
    });
    if (!deleted) return res.status(404).json({ status: 404, message: "Address not found" });
    return res.status(200).json({ status: 200, message: "Address deleted" });
  } catch (err) {
    next(err);
  }
};
