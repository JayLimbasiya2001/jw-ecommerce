
"use strict";

const { ProductimageService } = require("./service");

function coerceBool(val) {
  if (val === true || val === "true" || val === 1 || val === "1") return true;
  if (val === false || val === "false" || val === 0 || val === "0") return false;
  return undefined;
}

function buildPayload(body, isUpdate = false) {
  const payload = {};

  if (body.productId !== undefined) {
    const n = parseInt(body.productId, 10);
    if (!Number.isNaN(n)) payload.productId = n;
  }
  if (body.variantId !== undefined && body.variantId !== "" && body.variantId !== null) {
    const n = parseInt(body.variantId, 10);
    payload.variantId = Number.isNaN(n) ? null : n;
  } else if (!isUpdate) {
    payload.variantId = null;
  } else if (body.variantId === null || body.variantId === "") {
    payload.variantId = null;
  }

  if (body.image !== undefined) payload.image = String(body.image).trim();
  if (body.images !== undefined && Array.isArray(body.images)) {
    payload.images = body.images.map((x) => String(x).trim()).filter(Boolean);
  }
  if (body.altText !== undefined) payload.altText = String(body.altText ?? "");
  const isPrimary = coerceBool(body.isPrimary);
  if (isPrimary !== undefined) payload.isPrimary = isPrimary;
  if (body.rank !== undefined) {
    const n = parseInt(body.rank, 10);
    if (!Number.isNaN(n)) payload.rank = n;
  }

  if (!isUpdate) {
    if (payload.altText === undefined) payload.altText = "";
    if (payload.isPrimary === undefined) payload.isPrimary = false;
    if (payload.rank === undefined) payload.rank = 0;
  }

  return payload;
}

exports.create = async (req, res) => {
  try {
    const payload = buildPayload(req.body, false);
    if (!payload.productId) {
      return res.status(400).json({
        status: 400,
        message: "productId is required",
      });
    }

    const paths = [];
    if (Array.isArray(payload.images) && payload.images.length) {
      paths.push(...payload.images);
    }
    if (payload.image) {
      paths.push(payload.image);
    }
    if (!paths.length) {
      return res.status(400).json({
        status: 400,
        message:
          "At least one image is required: upload field `image` or multiple `images`, or send `image` / `images` URLs in JSON.",
      });
    }

    const seen = new Set();
    const uniquePaths = paths.filter((p) => {
      if (seen.has(p)) return false;
      seen.add(p);
      return true;
    });

    const baseRank = Number.isFinite(payload.rank) ? payload.rank : 0;
    const created = [];
    for (let i = 0; i < uniquePaths.length; i++) {
      const isPrimary =
        uniquePaths.length > 1
          ? i === 0
          : Boolean(payload.isPrimary);
      const row = await ProductimageService.create({
        productId: payload.productId,
        variantId: payload.variantId ?? null,
        image: uniquePaths[i],
        altText: payload.altText || "",
        isPrimary,
        rank: baseRank + i,
      });
      created.push(row);
    }

    const data =
      created.length === 1
        ? created[0]
        : { count: created.length, rows: created };

    return res.status(201).json({
      status: 201,
      data,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err?.message || err,
    });
  }
};

exports.get = async (req, res) => {
  try {
    const data = await ProductimageService.findOne({
      where: { id: req.params.id },
    });
    if (!data) {
      return res.status(404).json({
        status: 404,
        message: "Product image not found",
      });
    }
    return res.status(200).json({
      status: 200,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error?.message || error,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = buildPayload(req.body, true);
    const [affected] = await ProductimageService.update(payload, {
      where: { id },
    });
    if (!affected) {
      return res.status(404).json({
        status: 404,
        message: "Product image not found",
      });
    }
    const data = await ProductimageService.findOne({ where: { id } });
    return res.status(200).json({
      status: 200,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error?.message || error,
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await ProductimageService.remove({
      where: { id: req.params.id },
    });
    if (!deleted) {
      return res.status(404).json({
        status: 404,
        message: "Product image not found",
      });
    }
    return res.status(200).json({
      status: 200,
      message: "Product image deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error?.message || error,
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const where = {};
    if (req.query.productId !== undefined && req.query.productId !== "") {
      const n = parseInt(req.query.productId, 10);
      if (!Number.isNaN(n)) where.productId = n;
    }
    if (req.query.variantId !== undefined && req.query.variantId !== "") {
      if (req.query.variantId === "null") {
        where.variantId = null;
      } else {
        const n = parseInt(req.query.variantId, 10);
        if (!Number.isNaN(n)) where.variantId = n;
      }
    }

    const data = await ProductimageService.findAndCountAll({
      where,
      order: [["rank", "ASC"], ["id", "ASC"]],
    });

    if (!data || (typeof data.count === "number" && data.count === 0)) {
      return res.status(404).json({
        status: 404,
        message: "No product images found",
      });
    }
    return res.status(200).json({
      status: 200,
      message: "Product images fetched successfully",
      data,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err?.message || err,
    });
  }
};
