"use strict";

const { ReviewService } = require("./service");
const { parseReviewListQuery } = require("./listQuery");
const { buildPaginatedResponse } = require("../../middleware/listPagination");
const { OrdersService } = require("../orders/service");
const OrderItem = require("../orderitems/model");
const Customer = require("../customer/model");
const Product = require("../product/model");

function reviewInclude() {
  return [
    { model: Customer, attributes: ["id", "name"] },
    { model: Product, attributes: ["id", "name", "slug"] },
  ];
}

async function verifyOrderForReview(customerId, orderId, productId) {
  if (!orderId) return false;
  const order = await OrdersService.findOne({
    where: { id: orderId, customerId },
    include: [{ model: OrderItem, as: "items" }],
  });
  if (!order) return false;
  const plain = order.get({ plain: true });
  const delivered = ["delivered", "confirmed", "shipped"].includes(plain.orderStatus);
  const paid = plain.paymentStatus === "paid" || plain.paymentMethod === "cod";
  if (!delivered && !paid) return false;
  return (plain.items || []).some(
    (item) => String(item.productId) === String(productId)
  );
}

exports.create = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { productId, orderId, rating, title, comment } = req.body;

    const existing = await ReviewService.findOne({
      where: { customerId, productId },
    });
    if (existing) {
      return res.status(409).json({
        status: 409,
        message: "You have already reviewed this product",
      });
    }

    let isVerifiedPurchase = false;
    if (orderId) {
      isVerifiedPurchase = await verifyOrderForReview(customerId, orderId, productId);
      if (!isVerifiedPurchase) {
        return res.status(400).json({
          status: 400,
          message: "Order does not qualify for a verified review on this product",
        });
      }
    }

    const data = await ReviewService.create({
      productId,
      customerId,
      orderId: orderId || null,
      rating,
      title: title || null,
      comment: comment || null,
      isVerifiedPurchase,
      isApproved: false,
    });

    return res.status(201).json({
      status: 201,
      message: "Review submitted — pending approval",
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const isStaff = req.user?.accountType === "staff";
    const { where, order, limit, offset, page } = parseReviewListQuery(req.query, {
      publicOnly: !isStaff,
    });

    const result = await ReviewService.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: reviewInclude(),
      distinct: true,
    });

    const count =
      typeof result?.count === "number"
        ? result.count
        : Array.isArray(result?.count)
          ? result.count.length
          : 0;

    const body = buildPaginatedResponse(
      { count, rows: result?.rows ?? [] },
      page,
      limit,
      count === 0 ? "No reviews found" : "Reviews fetched successfully"
    );
    return res.status(200).json(body);
  } catch (err) {
    next(err);
  }
};

exports.getByProduct = async (req, res, next) => {
  try {
    req.query = { ...req.query, productId: req.params.productId, isApproved: "true" };
    return exports.getAll(req, res, next);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (req.user?.accountType !== "staff") {
      where.isApproved = true;
    }
    const data = await ReviewService.findOne({
      where,
      include: reviewInclude(),
    });
    if (!data) {
      return res.status(404).json({ status: 404, message: "Review not found" });
    }
    return res.status(200).json({ status: 200, data });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    delete payload.customerId;
    delete payload.productId;

    const [affected] = await ReviewService.update(payload, {
      where: { id: req.params.id },
    });
    if (!affected) {
      return res.status(404).json({ status: 404, message: "Review not found" });
    }
    const data = await ReviewService.findOne({
      where: { id: req.params.id },
      include: reviewInclude(),
    });
    return res.status(200).json({
      status: 200,
      message: "Review updated successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const deleted = await ReviewService.remove({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ status: 404, message: "Review not found" });
    }
    return res.status(200).json({
      status: 200,
      message: "Review deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.approve = async (req, res, next) => {
  try {
    const [affected] = await ReviewService.update(
      { isApproved: true },
      { where: { id: req.params.id } }
    );
    if (!affected) {
      return res.status(404).json({ status: 404, message: "Review not found" });
    }
    const data = await ReviewService.findOne({ where: { id: req.params.id } });
    return res.status(200).json({
      status: 200,
      message: "Review approved",
      data,
    });
  } catch (err) {
    next(err);
  }
};
