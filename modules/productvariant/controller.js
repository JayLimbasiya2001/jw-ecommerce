"use strict";

const { Sequelize } = require("sequelize");
const { ProductvariantService } = require("./service");
const { ProductimageService } = require("../productimage/service");
const ProductImage = require("../productimage/model");
const Attribute = require("../attribute/model");
const AttributeValue = require("../attributevalue/model");
const VariantAttribute = require("../variantattribute/model");
const {
  resolvePairsForPersist,
  findVariantWithSameSignature,
  replaceVariantAttributes,
  displayNameFromPairs,
  attachAttributesMapToVariant,
} = require("./attributes");

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

  return payload;
}

async function enrichVariantPlain(instance) {
  if (!instance) return null;
  const plain = instance.get({ plain: true });
  attachAttributesMapToVariant(plain);
  return plain;
}

async function findWithImages(id) {
  const row = await ProductvariantService.findOne({
    where: { id },
    include: [
      {
        model: ProductImage,
        as: "images",
        required: false,
        separate: true,
        order: [["rank", "ASC"]],
      },
      {
        model: VariantAttribute,
        as: "variantAttributes",
        required: false,
        separate: true,
        include: [
          {
            model: Attribute,
            as: "attribute",
            attributes: ["id", "key", "name"],
          },
          {
            model: AttributeValue,
            as: "attributeValue",
            attributes: ["id", "value"],
          },
        ],
      },
    ],
  });
  return enrichVariantPlain(row);
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

    const pairResult = await resolvePairsForPersist(req.body, null, false);
    if (!pairResult.ok) {
      return res.status(400).json({
        status: 400,
        message: pairResult.message,
      });
    }

    const skuTaken = await ProductvariantService.findOne({
      where: { sku: payload.sku },
    });
    if (skuTaken) {
      return res.status(409).json({
        status: 409,
        message: `SKU "${payload.sku}" is already in use.`,
      });
    }

    const dup = await findVariantWithSameSignature(
      payload.productId,
      pairResult.pairs,
      null
    );
    if (dup) {
      return res.status(409).json({
        status: 409,
        message:
          "A variant with the same attribute combination already exists for this product.",
      });
    }

    if (!payload.name || payload.name === "") {
      payload.name = await displayNameFromPairs(pairResult.pairs, payload.sku);
    }

    let variant;
    try {
      variant = await ProductvariantService.create(payload);
    } catch (err) {
      if (
        err.name === "SequelizeUniqueConstraintError" ||
        err instanceof Sequelize.UniqueConstraintError
      ) {
        return res.status(409).json({
          status: 409,
          message: `SKU "${payload.sku}" is already in use.`,
        });
      }
      throw err;
    }

    await replaceVariantAttributes(variant.id, pairResult.pairs);

    if (req.body.image) {
      await ProductimageService.create({
        productId: variant.productId,
        variantId: variant.id,
        image: String(req.body.image).trim(),
        altText: variant.name,
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

    const pairResult = await resolvePairsForPersist(req.body, current, true);
    if (!pairResult.ok) {
      return res.status(400).json({
        status: 400,
        message: pairResult.message,
      });
    }

    if (payload.sku !== undefined && payload.sku !== current.get("sku")) {
      const skuTaken = await ProductvariantService.findOne({
        where: { sku: payload.sku },
      });
      if (skuTaken) {
        return res.status(409).json({
          status: 409,
          message: `SKU "${payload.sku}" is already in use.`,
        });
      }
    }

    const productId = payload.productId !== undefined ? payload.productId : current.productId;

    const dup = await findVariantWithSameSignature(
      productId,
      pairResult.pairs,
      Number(id)
    );
    if (dup) {
      return res.status(409).json({
        status: 409,
        message:
          "Another variant with the same attribute combination exists for this product.",
      });
    }

    try {
      const [affected] = await ProductvariantService.update(payload, {
        where: { id },
      });
      if (!affected) {
        return res.status(404).json({
          status: 404,
          message: "Product variant not found",
        });
      }
    } catch (err) {
      if (
        err.name === "SequelizeUniqueConstraintError" ||
        err instanceof Sequelize.UniqueConstraintError
      ) {
        return res.status(409).json({
          status: 409,
          message: `SKU "${payload.sku ?? current.get("sku")}" is already in use.`,
        });
      }
      throw err;
    }

    await replaceVariantAttributes(Number(id), pairResult.pairs);

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
    const vid = req.params.id;
    await VariantAttribute.destroy({
      where: { variantId: vid },
      force: true,
    });
    const deleted = await ProductvariantService.remove({
      where: { id: vid },
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

    const rows = await ProductvariantService.findAndCountAll({
      where,
      include: [
        {
          model: ProductImage,
          as: "images",
          required: false,
          separate: true,
          order: [["rank", "ASC"]],
        },
        {
          model: VariantAttribute,
          as: "variantAttributes",
          required: false,
          separate: true,
          include: [
            {
              model: Attribute,
              as: "attribute",
              attributes: ["id", "key", "name"],
            },
            {
              model: AttributeValue,
              as: "attributeValue",
              attributes: ["id", "value"],
            },
          ],
        },
      ],
      order: [["id", "ASC"]],
    });

    const count = typeof rows.count === "number" ? rows.count : rows.rows?.length ?? 0;
    const plainRows = (rows.rows || []).map((r) => {
      const p = r.get({ plain: true });
      attachAttributesMapToVariant(p);
      return p;
    });

    const data = { count, rows: plainRows };

    if (!plainRows.length) {
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
