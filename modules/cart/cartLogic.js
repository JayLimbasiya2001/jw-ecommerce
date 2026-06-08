"use strict";

const { Op } = require("sequelize");
const Product = require("../product/model");
const ProductVariant = require("../productvariant/model");
const ProductImage = require("../productimage/model");
const VariantAttribute = require("../variantattribute/model");
const Attribute = require("../attribute/model");
const AttributeValue = require("../attributevalue/model");
const { attachAttributesMapToVariant } = require("../productvariant/attributes");

function httpError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function countVariantsForProduct(productId) {
  return ProductVariant.count({ where: { productId } });
}

async function validateCartLine({ productId, variantId, quantity }) {
  const qty = Math.max(parseInt(quantity, 10) || 1, 1);
  const product = await Product.findByPk(productId);
  if (!product || !product.isActive) {
    throw httpError("Product not found or inactive", 404);
  }

  const variantCount = await countVariantsForProduct(productId);

  if (variantCount > 0) {
    if (!variantId) {
      throw httpError("variantId is required for this product", 400);
    }
    const variant = await ProductVariant.findOne({
      where: { id: variantId, productId },
    });
    if (!variant || !variant.isActive) {
      throw httpError("Variant not found or inactive", 404);
    }
    if (variant.stock < qty) {
      throw httpError(`Only ${variant.stock} item(s) available in stock`, 400);
    }
    return {
      product,
      variant,
      quantity: qty,
      unitPrice: variant.price,
      lineName: variant.name || product.name,
      lineSku: variant.sku,
    };
  }

  if (variantId) {
    throw httpError("This product has no variants; do not send variantId", 400);
  }
  if (product.stock < qty) {
    throw httpError(`Only ${product.stock} item(s) available in stock`, 400);
  }
  const unitPrice =
    product.salePrice > 0 && product.salePrice < product.basePrice
      ? product.salePrice
      : product.basePrice;

  return {
    product,
    variant: null,
    quantity: qty,
    unitPrice,
    lineName: product.name,
    lineSku: product.sku,
  };
}

function cartIncludeOptions() {
  return [
    {
      model: Product,
      attributes: [
        "id",
        "name",
        "slug",
        "sku",
        "basePrice",
        "salePrice",
        "stock",
        "isActive",
        "metalType",
        "stoneType",
      ],
      include: [
        {
          model: ProductImage,
          required: false,
          where: { variantId: null },
          separate: true,
          order: [
            ["isPrimary", "DESC"],
            ["rank", "ASC"],
          ],
          limit: 5,
        },
      ],
    },
    {
      model: ProductVariant,
      as: "variant",
      required: false,
      include: [
        {
          model: ProductImage,
          as: "images",
          required: false,
          separate: true,
          order: [
            ["isPrimary", "DESC"],
            ["rank", "ASC"],
          ],
        },
        {
          model: VariantAttribute,
          as: "variantAttributes",
          required: false,
          separate: true,
          include: [
            { model: Attribute, as: "attribute", attributes: ["id", "key", "name"] },
            { model: AttributeValue, as: "attributeValue", attributes: ["id", "value"] },
          ],
        },
      ],
    },
  ];
}

function pickPrimaryImage(images = []) {
  if (!images.length) return null;
  const primary = images.find((i) => i.isPrimary) || images[0];
  return primary?.image ?? null;
}

function formatCartItem(row) {
  const plain = row.get ? row.get({ plain: true }) : { ...row };
  const product = plain.product || null;
  const variant = plain.variant || null;

  let variantDetails = null;
  if (variant) {
    attachAttributesMapToVariant(variant);
    variantDetails = {
      id: variant.id,
      name: variant.name,
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
      isActive: variant.isActive,
      attributes: variant.attributes || {},
      image: pickPrimaryImage(variant.images),
      images: (variant.images || []).map((img) => ({
        id: img.id,
        image: img.image,
        altText: img.altText,
        isPrimary: img.isPrimary,
      })),
    };
  }

  const unitPrice = variantDetails ? variantDetails.price : product?.salePrice ?? product?.basePrice ?? 0;
  const lineTotal = unitPrice * (plain.quantity || 1);

  return {
    id: plain.id,
    customerId: plain.customerId,
    productId: plain.productId,
    variantId: plain.variantId,
    quantity: plain.quantity,
    unitPrice,
    lineTotal,
    product: product
      ? {
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          basePrice: product.basePrice,
          salePrice: product.salePrice,
          image: pickPrimaryImage(product.productimages),
        }
      : null,
    variant: variantDetails,
    created_at: plain.created_at,
    updated_at: plain.updated_at,
  };
}

function summarizeCart(items) {
  const subtotal = items.reduce((sum, row) => sum + (row.lineTotal || 0), 0);
  const itemCount = items.reduce((sum, row) => sum + (row.quantity || 0), 0);
  return { itemCount, subtotal };
}

function cartLineWhere(customerId, productId, variantId) {
  return {
    customerId,
    productId,
    variantId: variantId != null ? variantId : { [Op.is]: null },
  };
}

module.exports = {
  validateCartLine,
  cartIncludeOptions,
  formatCartItem,
  summarizeCart,
  cartLineWhere,
  httpError,
};
