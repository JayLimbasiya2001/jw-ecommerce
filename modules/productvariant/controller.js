
"use strict";

const { Op } = require("sequelize");
const { ProductvariantService } = require("./service");
const { ProductimageService } = require("../productimage/service");
const ProductImage = require("../productimage/model");

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
  if (body.name !== undefined) payload.name = String(body.name).trim();
  if (body.color !== undefined) {
    const c = body.color == null || body.color === "" ? null : String(body.color).trim();
    payload.color = c;
  }
  if (body.size !== undefined) {
    const s = body.size == null || body.size === "" ? null : String(body.size).trim();
    payload.size = s;
  }
  if (body.sku !== undefined) payload.sku = String(body.sku).trim();
  if (body.price !== undefined) {
    const n = parseInt(body.price, 10);
    if (!Number.isNaN(n)) payload.price = n;
  }
  if (body.stock !== undefined) {
    const n = parseInt(body.stock, 10);
    if (!Number.isNaN(n)) payload.stock = n;
  }
  const isActive = coerceBool(body.isActive);
  if (isActive !== undefined) payload.isActive = isActive;
  if (!isUpdate && payload.isActive === undefined) payload.isActive = true;

  // Real-world label: "Red / M" when name omitted; else fall back to sku
  if (!isUpdate) {
    if (!payload.name || String(payload.name).trim() === "") {
      const parts = [payload.color, payload.size].filter(
        (x) => x != null && String(x).trim() !== ""
      );
      if (parts.length) {
        payload.name = parts.join(" / ");
      } else if (payload.sku) {
        payload.name = String(payload.sku);
      }
    }
  }

  return payload;
}

async function findWithImages(id) {
  return ProductvariantService.findOne({
    where: { id },
    include: [
      {
        model: ProductImage,
        as: "images",
        required: false,
        separate: true,
        order: [["rank", "ASC"]],
      },
    ],
  });
}

async function upsertPrimaryVariantImage(variantId, productId, imagePath, label) {
  const primary = await ProductimageService.findOne({
    where: { variantId, isPrimary: true },
  });
  if (primary) {
    await ProductimageService.update(
      { image: imagePath },
      { where: { id: primary.id } }
    );
    return;
  }
  await ProductimageService.create({
    productId,
    variantId,
    image: imagePath,
    altText: label || "",
    isPrimary: true,
    rank: 0,
  });
}

exports.create = async (req, res) => {
  try {
    const payload = buildPayload(req.body, false);
    if (!payload.productId || !payload.sku) {
      return res.status(400).json({
        status: 400,
        message: "productId and sku are required",
      });
    }
    if (payload.price === undefined || payload.stock === undefined) {
      return res.status(400).json({
        status: 400,
        message: "price and stock are required",
      });
    }

    const colorKey =
      payload.color != null && String(payload.color).trim() !== ""
        ? String(payload.color).trim()
        : null;
    const sizeKey =
      payload.size != null && String(payload.size).trim() !== ""
        ? String(payload.size).trim()
        : null;
    if (colorKey != null && sizeKey != null) {
      const existing = await ProductvariantService.findOne({
        where: {
          productId: payload.productId,
          color: colorKey,
          size: sizeKey,
        },
      });
      if (existing) {
        return res.status(409).json({
          status: 409,
          message: `A variant already exists for this product with color "${colorKey}" and size "${sizeKey}".`,
        });
      }
    }

    const variant = await ProductvariantService.create(payload);

    if (req.body.image) {
      await ProductimageService.create({
        productId: variant.productId,
        variantId: variant.id,
        image: String(req.body.image).trim(),
        altText: payload.name,
        isPrimary: true,
        rank: 0,
      });
    }

    const data = await findWithImages(variant.id);
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
    const data = await findWithImages(req.params.id);
    if (!data) {
      return res.status(404).json({
        status: 404,
        message: "Product variant not found",
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
    const current = await ProductvariantService.findOne({ where: { id } });
    if (!current) {
      return res.status(404).json({
        status: 404,
        message: "Product variant not found",
      });
    }

    const payload = buildPayload(req.body, true);
    const nextColor =
      payload.color !== undefined ? payload.color : current.color;
    const nextSize = payload.size !== undefined ? payload.size : current.size;
    const nc =
      nextColor != null && String(nextColor).trim() !== ""
        ? String(nextColor).trim()
        : null;
    const ns =
      nextSize != null && String(nextSize).trim() !== ""
        ? String(nextSize).trim()
        : null;
    if (nc != null && ns != null) {
      const conflict = await ProductvariantService.findOne({
        where: {
          productId: current.productId,
          color: nc,
          size: ns,
          id: { [Op.ne]: id },
        },
      });
      if (conflict) {
        return res.status(409).json({
          status: 409,
          message: `Another variant already uses color "${nc}" and size "${ns}" for this product.`,
        });
      }
    }

    const [affected] = await ProductvariantService.update(payload, {
      where: { id },
    });
    if (!affected) {
      return res.status(404).json({
        status: 404,
        message: "Product variant not found",
      });
    }

    if (req.body.image) {
      const variant = await ProductvariantService.findOne({ where: { id } });
      if (variant) {
        await upsertPrimaryVariantImage(
          variant.id,
          variant.productId,
          String(req.body.image).trim(),
          variant.name
        );
      }
    }

    const data = await findWithImages(id);
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
    const deleted = await ProductvariantService.remove({
      where: { id: req.params.id },
    });
    if (!deleted) {
      return res.status(404).json({
        status: 404,
        message: "Product variant not found",
      });
    }
    return res.status(200).json({
      status: 200,
      message: "Product variant deleted successfully",
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
    const productId = req.query.productId;
    const where = {};
    if (productId !== undefined && productId !== "") {
      const n = parseInt(productId, 10);
      if (!Number.isNaN(n)) where.productId = n;
    }

    const data = await ProductvariantService.findAndCountAll({
      where,
      include: [
        {
          model: ProductImage,
          as: "images",
          required: false,
          separate: true,
          order: [["rank", "ASC"]],
        },
      ],
      order: [["id", "ASC"]],
    });

    if (!data || (typeof data.count === "number" && data.count === 0)) {
      return res.status(404).json({
        status: 404,
        message: "No product variants found",
      });
    }
    return res.status(200).json({
      status: 200,
      message: "Product variants fetched successfully",
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
