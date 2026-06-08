"use strict";

const { WishlistService } = require("./service");
const { parseWishlistListQuery } = require("./listQuery");
const { buildPaginatedResponse } = require("../../middleware/listPagination");
const Product = require("../product/model");

async function findOwned(id, customerId) {
  return WishlistService.findOne({
    where: { id, customerId },
    include: [{ model: Product, attributes: ["id", "name", "slug", "salePrice", "basePrice"] }],
  });
}

exports.create = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const productId = req.body.productId;
    const existing = await WishlistService.findOne({ where: { customerId, productId } });
    if (existing) {
      return res.status(200).json({ status: 200, message: "Already in wishlist", data: existing });
    }
    const data = await WishlistService.create({ customerId, productId });
    return res.status(201).json({ status: 201, message: "Added to wishlist", data });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { where, order, limit, offset, page } = parseWishlistListQuery(req.query, {
      customerId: req.user.id,
    });
    const result = await WishlistService.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: [{ model: Product, attributes: ["id", "name", "slug", "salePrice", "basePrice"] }],
    });
    const count = typeof result?.count === "number" ? result.count : 0;
    const body = buildPaginatedResponse(
      { count, rows: result?.rows ?? [] },
      page,
      limit,
      count === 0 ? "Wishlist is empty" : "Wishlist fetched successfully"
    );
    return res.status(200).json(body);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const data = await findOwned(req.params.id, req.user.id);
    if (!data) return res.status(404).json({ status: 404, message: "Wishlist item not found" });
    return res.status(200).json({ status: 200, data });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const deleted = await WishlistService.remove({
      where: { id: req.params.id, customerId: req.user.id },
    });
    if (!deleted) return res.status(404).json({ status: 404, message: "Wishlist item not found" });
    return res.status(200).json({ status: 200, message: "Removed from wishlist" });
  } catch (err) {
    next(err);
  }
};
