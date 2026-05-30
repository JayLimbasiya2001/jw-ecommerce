"use strict";

const { Op } = require("sequelize");
const { CouponService } = require("./service");
const { parseCouponListQuery } = require("./listQuery");
const { buildPaginatedResponse } = require("../../middleware/listPagination");

function coerceBool(val) {
  if (val === true || val === "true" || val === 1 || val === "1") return true;
  if (val === false || val === "false" || val === 0 || val === "0") return false;
  return undefined;
}

function parseDecimal(val) {
  if (val === undefined || val === null || val === "") return undefined;
  const n = parseFloat(val);
  return Number.isNaN(n) ? undefined : n;
}

function parseIntField(val) {
  if (val === undefined || val === null || val === "") return undefined;
  const n = parseInt(val, 10);
  return Number.isNaN(n) ? undefined : n;
}

function buildPayload(body, isUpdate = false) {
  const payload = {};

  if (body.couponCode !== undefined) {
    payload.couponCode = String(body.couponCode).trim().toUpperCase();
  }
  if (body.description !== undefined) {
    payload.description = String(body.description ?? "");
  }
  if (body.discountType !== undefined) {
    payload.discountType = String(body.discountType).trim().toLowerCase();
  }

  const discountValue = parseDecimal(body.discountValue);
  if (discountValue !== undefined) payload.discountValue = discountValue;

  const minPurchaseAmount = parseDecimal(body.minPurchaseAmount);
  if (minPurchaseAmount !== undefined) payload.minPurchaseAmount = minPurchaseAmount;

  const maxDiscountAmount = parseDecimal(body.maxDiscountAmount);
  if (maxDiscountAmount !== undefined) payload.maxDiscountAmount = maxDiscountAmount;

  const usageLimit = parseIntField(body.usageLimit);
  if (usageLimit !== undefined) payload.usageLimit = usageLimit;
  if (body.usageLimit === null || body.usageLimit === "") payload.usageLimit = null;

  const usageCount = parseIntField(body.usageCount);
  if (usageCount !== undefined) payload.usageCount = usageCount;

  const perUserLimit = parseIntField(body.perUserLimit);
  if (perUserLimit !== undefined) payload.perUserLimit = perUserLimit;

  const isActive = coerceBool(body.isActive);
  if (isActive !== undefined) payload.isActive = isActive;

  if (body.validFrom !== undefined && body.validFrom !== "") {
    payload.validFrom = body.validFrom;
  } else if (body.validFrom === null || body.validFrom === "") {
    payload.validFrom = null;
  }
  if (body.validUntil !== undefined && body.validUntil !== "") {
    payload.validUntil = body.validUntil;
  } else if (body.validUntil === null || body.validUntil === "") {
    payload.validUntil = null;
  }

  if (!isUpdate) {
    if (payload.minPurchaseAmount === undefined) payload.minPurchaseAmount = 0;
    if (payload.usageCount === undefined) payload.usageCount = 0;
    if (payload.perUserLimit === undefined) payload.perUserLimit = 1;
    if (payload.isActive === undefined) payload.isActive = true;
  }

  return payload;
}

function isCouponCurrentlyValid(coupon, now = new Date()) {
  if (!coupon || !coupon.isActive) return false;
  if (coupon.validFrom && new Date(coupon.validFrom) > now) return false;
  if (coupon.validUntil && new Date(coupon.validUntil) < now) return false;
  if (
    coupon.usageLimit != null &&
    coupon.usageCount >= coupon.usageLimit
  ) {
    return false;
  }
  return true;
}

function handleDbError(err, res) {
  if (
    err.name === "SequelizeUniqueConstraintError" ||
    (err.parent && err.parent.code === "23505")
  ) {
    return res.status(409).json({
      status: 409,
      message: "Coupon code already exists",
    });
  }
  return null;
}

/** Public: validate coupon at checkout */
exports.validateByCode = async (req, res, next) => {
  try {
    const code = String(req.params.code || "").trim().toUpperCase();
    if (!code) {
      return res.status(400).json({
        status: 400,
        message: "Coupon code is required",
      });
    }

    const coupon = await CouponService.findOne({
      where: { couponCode: code, isActive: true },
    });

    if (!coupon) {
      return res.status(404).json({
        status: 404,
        message: "Invalid or inactive coupon code",
      });
    }

    const plain = coupon.get ? coupon.get({ plain: true }) : coupon;
    if (!isCouponCurrentlyValid(plain)) {
      return res.status(400).json({
        status: 400,
        message: "Coupon is expired or usage limit reached",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Coupon is valid",
      data: plain,
    });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const payload = buildPayload(req.body, false);
    if (!payload.couponCode || !payload.discountType || payload.discountValue == null) {
      return res.status(400).json({
        status: 400,
        message: "couponCode, discountType, and discountValue are required",
      });
    }
    if (payload.discountType === "percentage" && payload.discountValue > 100) {
      return res.status(400).json({
        status: 400,
        message: "Percentage discount cannot exceed 100",
      });
    }

    const data = await CouponService.create(payload);
    return res.status(201).json({
      status: 201,
      message: "Coupon created successfully",
      data,
    });
  } catch (err) {
    const handled = handleDbError(err, res);
    if (handled) return handled;
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const data = await CouponService.findOne({ where: { id: req.params.id } });
    if (!data) {
      return res.status(404).json({ status: 404, message: "Coupon not found" });
    }
    return res.status(200).json({ status: 200, data });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const payload = buildPayload(req.body, true);
    const [affected] = await CouponService.update(payload, { where: { id } });
    if (!affected) {
      return res.status(404).json({ status: 404, message: "Coupon not found" });
    }
    const data = await CouponService.findOne({ where: { id } });
    return res.status(200).json({
      status: 200,
      message: "Coupon updated successfully",
      data,
    });
  } catch (err) {
    const handled = handleDbError(err, res);
    if (handled) return handled;
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const deleted = await CouponService.remove({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ status: 404, message: "Coupon not found" });
    }
    return res.status(200).json({
      status: 200,
      message: "Coupon deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { where, order, limit, offset, page } = parseCouponListQuery(req.query);
    const result = await CouponService.findAndCountAll({
      where,
      order,
      limit,
      offset,
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
      count === 0 ? "No coupons found" : "Coupons fetched successfully"
    );
    return res.status(200).json(body);
  } catch (err) {
    next(err);
  }
};
