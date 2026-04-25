
const { Op } = require("sequelize");
const sequelize = require("../../config/db");
const Model = require("./model");
const ProductVariant = require("../productvariant/model");
const ProductImage = require("../productimage/model");
const VariantAttribute = require("../variantattribute/model");
const Attribute = require("../attribute/model");
const AttributeValue = require("../attributevalue/model");
const {
  attachAttributesMapToVariant,
  mergeAttributePairs,
  findVariantWithSameSignature,
  replaceVariantAttributes,
  displayNameFromPairs,
  splitVariantCreateItem,
  signatureFromPairs,
} = require("../productvariant/attributes");

function httpError(statusCode, message) {
  const e = new Error(message);
  e.statusCode = statusCode;
  return e;
}

function coerceVariantBool(val) {
  if (val === true || val === "true" || val === 1 || val === "1") return true;
  if (val === false || val === "false" || val === 0 || val === "0") return false;
  return undefined;
}

const productVariantDetailInclude = [
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
];

function sizeSortKey(a, b) {
  const na = parseFloat(String(a ?? ""));
  const nb = parseFloat(String(b ?? ""));
  if (!Number.isNaN(na) && !Number.isNaN(nb) && String(a).trim() !== "" && String(b).trim() !== "") {
    return na - nb;
  }
  return String(a ?? "").localeCompare(String(b ?? ""), undefined, { numeric: true });
}

function toClientVariantShape(variantPlain) {
  const v = { ...variantPlain };
  attachAttributesMapToVariant(v);
  const attrs = v.attributes || {};
  return {
    ...attrs,
    sku: v.sku,
    price: v.price,
    stock: v.stock,
    isActive: v.isActive,
  };
}

/** Groups normalized client variants by `color` key when present. */
function buildVariantsByColor(flatVariants) {
  if (!Array.isArray(flatVariants) || flatVariants.length === 0) return [];
  const groups = new Map();
  for (const v of flatVariants) {
    const c =
      v.color != null && String(v.color).trim() !== ""
        ? String(v.color).trim()
        : "";
    if (!groups.has(c)) groups.set(c, []);
    groups.get(c).push(v);
  }
  const keys = Array.from(groups.keys()).sort((a, b) => a.localeCompare(b));
  return keys.map((key) => {
    const list = groups.get(key);
    list.sort((x, y) => sizeSortKey(x.size, y.size));
    return {
      color: key === "" ? null : key,
      variants: list,
    };
  });
}

function attachVariantsByColor(plain) {
  if (!plain || !Array.isArray(plain.variants)) {
    plain.variantsByColor = [];
    return;
  }
  const normalized = plain.variants.map(toClientVariantShape);
  plain.variants = normalized;
  plain.variantsByColor = buildVariantsByColor(normalized);
}

/** Sort product-level only images (variantId null) */
function sortGalleryImages(rows) {
  return [...rows].sort(
    (a, b) => (a.rank || 0) - (b.rank || 0) || (a.id || 0) - (b.id || 0)
  );
}

/** All images for a product: null variantId first, then by variantId, rank */
function sortAllProductImages(rows) {
  return [...rows].sort((a, b) => {
    const av = a.variantId == null ? -1 : a.variantId;
    const bv = b.variantId == null ? -1 : b.variantId;
    if (av !== bv) return av - bv;
    return (a.rank || 0) - (b.rank || 0) || (a.id || 0) - (b.id || 0);
  });
}

function splitProductImages(allPlain) {
  const gallery = allPlain.filter((x) => x.variantId == null);
  return {
    galleryImages: sortGalleryImages(gallery),
    allProductImages: sortAllProductImages(allPlain),
  };
}

function attachGalleryImagesToProducts(rowsPlain, allImageRows) {
  const byProduct = {};
  for (const g of allImageRows) {
    const pid = g.productId;
    if (!byProduct[pid]) byProduct[pid] = [];
    byProduct[pid].push(g.get({ plain: true }));
  }
  for (const p of rowsPlain) {
    const list = byProduct[p.id] || [];
    const { galleryImages, allProductImages } = splitProductImages(list);
    p.galleryImages = galleryImages;
    p.allProductImages = allProductImages;
    if (Array.isArray(p.variants)) {
      p.variants.sort((a, b) => (a.id || 0) - (b.id || 0));
    }
    attachVariantsByColor(p);
  }
  return rowsPlain;
}

const SORTABLE = new Set(["id", "name", "salePrice", "basePrice", "stock", "created_at"]);

/**
 * Maps GET /api/products query params → Sequelize where, order, limit, offset, page.
 * Filters: categoryId, brandId, isActive, isNewArrival, search|q|name|related (ILIKE name/slug/sku/description),
 * minPrice, maxPrice, priceField (salePrice|basePrice, default salePrice).
 * Pagination: page (default 1), limit (default 20, max 100).
 * Sort: sortBy, sortOrder (asc|desc).
 */
function parseProductListQuery(query = {}) {
  const where = {};

  if (query.categoryId != null && query.categoryId !== "") {
    const n = parseInt(query.categoryId, 10);
    if (!Number.isNaN(n)) where.categoryId = n;
  }
  if (query.brandId != null && query.brandId !== "") {
    const n = parseInt(query.brandId, 10);
    if (!Number.isNaN(n)) where.brandId = n;
  }
  if (query.isActive !== undefined && query.isActive !== "") {
    const v = query.isActive;
    where.isActive = v === "true" || v === true || v === "1" || v === 1;
  }
  if (query.isNewArrival !== undefined && query.isNewArrival !== "") {
    const v = query.isNewArrival;
    where.isNewArrival = v === "true" || v === true || v === "1" || v === 1;
  }

  const rawSearch = query.search ?? query.q ?? query.name ?? query.related;
  if (rawSearch != null && String(rawSearch).trim() !== "") {
    const term = `%${String(rawSearch).trim()}%`;
    where[Op.or] = [
      { name: { [Op.iLike]: term } },
      { slug: { [Op.iLike]: term } },
      { sku: { [Op.iLike]: term } },
      { description: { [Op.iLike]: term } },
    ];
  }

  const priceField =
    query.priceField === "basePrice" ? "basePrice" : "salePrice";
  let minP;
  let maxP;
  if (query.minPrice != null && query.minPrice !== "") {
    const n = parseInt(query.minPrice, 10);
    if (!Number.isNaN(n)) minP = n;
  }
  if (query.maxPrice != null && query.maxPrice !== "") {
    const n = parseInt(query.maxPrice, 10);
    if (!Number.isNaN(n)) maxP = n;
  }
  if (minP !== undefined || maxP !== undefined) {
    const bounds = {};
    if (minP !== undefined) bounds[Op.gte] = minP;
    if (maxP !== undefined) bounds[Op.lte] = maxP;
    where[priceField] = bounds;
  }

  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const offset = (page - 1) * limit;

  const sortBy = SORTABLE.has(String(query.sortBy || "").trim())
    ? String(query.sortBy).trim()
    : "id";
  const dir =
    String(query.sortOrder || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
  const order = [[sortBy, dir]];

  return { where, order, limit, offset, page };
}

/**
 * Create product + SKUs in one request. Each `variants[]` item can be shorthand:
 * `{ "color": "red", "size": "M", "sku": "...", "price": 500, "stock": 10 }`
 * or `{ "attributes": { "purity": "18k" }, "price": 100 }`. Reserved keys:
 * sku, price, stock, name, isActive, image, attributeValueIds, attributes.
 */
async function createProductWithVariants(body) {
  const variants = body.variants;
  const productPayload = { ...body };
  delete productPayload.variants;

  const t = await sequelize.transaction();
  try {
    const productRow = await Model.create(productPayload, { transaction: t });
    const pid = productRow.id;
    const productPlain = productRow.get({ plain: true });
    const seenSig = new Set();

    for (let i = 0; i < variants.length; i++) {
      const item = variants[i];
      const { meta, attributesForPairs } = splitVariantCreateItem(item);

      const merged = await mergeAttributePairs({
        attributes: attributesForPairs,
        attributeValueIds: meta.attributeValueIds,
      });
      if (!merged.ok) {
        throw httpError(400, merged.message || "Invalid variant attributes");
      }

      const sig = signatureFromPairs(merged.pairs);
      if (merged.pairs.length && seenSig.has(sig)) {
        throw httpError(
          400,
          `Duplicate attribute combination in variants[${i}] (matches an earlier row).`
        );
      }
      if (merged.pairs.length) seenSig.add(sig);

      const dup = await findVariantWithSameSignature(pid, merged.pairs, null, t);
      if (dup) {
        throw httpError(
          409,
          `Variant at index ${i} duplicates an existing combination for this product.`
        );
      }

      let sku =
        meta.sku != null && String(meta.sku).trim() !== ""
          ? String(meta.sku).trim()
          : `${productPlain.sku}-V${i + 1}`;

      const skuTaken = await ProductVariant.findOne({
        where: { sku },
        transaction: t,
      });
      if (skuTaken) {
        throw httpError(409, `SKU "${sku}" is already in use (variants[${i}]).`);
      }

      let price;
      if (meta.price !== undefined && meta.price !== null && meta.price !== "") {
        price = parseInt(meta.price, 10);
      } else {
        price = productPlain.salePrice;
      }

      let stock;
      if (meta.stock !== undefined && meta.stock !== null && meta.stock !== "") {
        stock = parseInt(meta.stock, 10);
      } else {
        stock = 0;
      }

      if (Number.isNaN(price)) {
        throw httpError(400, `Invalid price at variants[${i}]`);
      }
      if (Number.isNaN(stock)) {
        throw httpError(400, `Invalid stock at variants[${i}]`);
      }

      let name =
        meta.name != null && String(meta.name).trim() !== ""
          ? String(meta.name).trim()
          : await displayNameFromPairs(merged.pairs, sku);

      const ab = coerceVariantBool(meta.isActive);
      const isActive = ab === undefined ? true : ab;

      let variant;
      try {
        variant = await ProductVariant.create(
          {
            productId: pid,
            sku,
            price,
            stock,
            name,
            isActive,
          },
          { transaction: t }
        );
      } catch (err) {
        if (
          err.name === "SequelizeUniqueConstraintError" ||
          (err.parent && err.parent.code === "23505")
        ) {
          throw httpError(409, `SKU "${sku}" is already in use (variants[${i}]).`);
        }
        throw err;
      }

      await replaceVariantAttributes(variant.id, merged.pairs, t);

      if (meta.image != null && String(meta.image).trim() !== "") {
        await ProductImage.create(
          {
            productId: pid,
            variantId: variant.id,
            image: String(meta.image).trim(),
            altText: name,
            isPrimary: true,
            rank: 0,
          },
          { transaction: t }
        );
      }
    }

    await t.commit();
    return exports.ProductService.findOneWithDetails(pid);
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

exports.ProductService = {
  parseProductListQuery,

  create: async (data) => {
    if (Array.isArray(data.variants) && data.variants.length > 0) {
      return createProductWithVariants(data);
    }
    const payload = { ...data };
    delete payload.variants;
    return Model.create(payload);
  },

  get: async (conditions) => {
    return Model.findAll(conditions);
  },

  findAll: async (condition) => {
    return Model.findAll(condition);
  },

  update: async (data, condition) => {
    return Model.update(data, condition);
  },

  remove: async (condition) => {
    return Model.destroy(condition);
  },

  findAndCountAll: async (condition) => {
    return Model.findAndCountAll(condition);
  },

  count: async (condition) => {
    return Model.count(condition);
  },

  bulkCreate: async (data) => {
    return Model.bulkCreate(data);
  },

  findOne: async (conditions) => {
    return Model.findOne(conditions);
  },

  /**
   * Single product with variants (each with variant-specific images).
   * - galleryImages: only rows where variantId is null (product-wide carousel, no SKU).
   * - allProductImages: every image row for this product (variant + gallery), flat list.
   */
  findOneWithDetails: async (id) => {
    const row = await Model.findOne({
      where: { id },
      include: [
        {
          model: ProductVariant,
          as: "variants",
          required: false,
          include: productVariantDetailInclude,
        },
      ],
    });
    if (!row) return null;

    const allImageRows = await ProductImage.findAll({
      where: { productId: id },
    });
    const allPlain = allImageRows.map((g) => g.get({ plain: true }));
    const { galleryImages, allProductImages } = splitProductImages(allPlain);

    const plain = row.get({ plain: true });
    plain.galleryImages = galleryImages;
    plain.allProductImages = allProductImages;
    if (Array.isArray(plain.variants)) {
      plain.variants.sort((a, b) => (a.id || 0) - (b.id || 0));
    }
    attachVariantsByColor(plain);
    return plain;
  },

  /**
   * Product list: same shape as findOneWithDetails (variants[].images, galleryImages, allProductImages).
   */
  findAllWithDetails: async ({ where = {}, limit, offset, order } = {}) => {
    const count = await Model.count({ where });
    const rows = await Model.findAll({
      where,
      limit,
      offset,
      order: order || [["id", "DESC"]],
      include: [
        {
          model: ProductVariant,
          as: "variants",
          required: false,
          include: productVariantDetailInclude,
        },
      ],
    });

    const plainRows = rows.map((r) => r.get({ plain: true }));
    const ids = plainRows.map((p) => p.id);
    if (ids.length === 0) {
      return { count, rows: [] };
    }

    const allImageRows = await ProductImage.findAll({
      where: {
        productId: { [Op.in]: ids },
      },
      order: [
        ["productId", "ASC"],
        ["variantId", "ASC"],
        ["rank", "ASC"],
        ["id", "ASC"],
      ],
    });

    attachGalleryImagesToProducts(plainRows, allImageRows);
    return { count, rows: plainRows };
  },
};
