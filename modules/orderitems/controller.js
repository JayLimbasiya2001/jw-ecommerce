"use strict";

const { OrderitemsService } = require("./service");
const Product = require("../product/model");
const ProductVariant = require("../productvariant/model");
const Order = require("../orders/model");

exports.get = async (req, res, next) => {
  try {
    const data = await OrderitemsService.findOne({
      where: { id: req.params.id },
      include: [
        { model: Order, attributes: ["id", "customerId", "orderStatus"] },
        { model: Product, attributes: ["id", "name", "slug"] },
        { model: ProductVariant, required: false, attributes: ["id", "name", "sku"] },
      ],
    });
    if (!data) {
      return res.status(404).json({ status: 404, message: "Order item not found" });
    }
    return res.status(200).json({ status: 200, data });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.orderId) {
      where.orderId = parseInt(req.query.orderId, 10);
    }
    const data = await OrderitemsService.findAndCountAll({
      where,
      include: [
        { model: Product, attributes: ["id", "name"] },
        { model: ProductVariant, required: false, attributes: ["id", "sku"] },
      ],
      order: [["id", "DESC"]],
      limit: Math.min(parseInt(req.query.limit, 10) || 50, 100),
      offset: 0,
    });
    return res.status(200).json({
      status: 200,
      data,
    });
  } catch (err) {
    next(err);
  }
};
