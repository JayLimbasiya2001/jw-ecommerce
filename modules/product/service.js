
const { Op } = require("sequelize");
const Model = require("./model");
const ProductVariant = require("../productvariant/model");
const ProductImage = require("../productimage/model");

function sizeSortKey(a, b) {
  const na = parseFloat(String(a ?? ""));
  const nb = parseFloat(String(b ?? ""));
  if (!Number.isNaN(na) && !Number.isNaN(nb) && String(a).trim() !== "" && String(b).trim() !== "") {
    return na - nb;
  }
  return String(a ?? "").localeCompare(String(b ?? ""), undefined, { numeric: true });
}

/**
 * Groups flat variants for UI: e.g. Red → [4,5,6], Yellow → [4,5] (different size sets per color).
 * Data model stays one row per (product + color + size); this is a presentation layer only.
 */
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
      /** All SKUs for this color (each row is still one color+size combination). */
      variants: list,
    };
  });
}

function attachVariantsByColor(plain) {
  if (!plain || !Array.isArray(plain.variants)) {
    plain.variantsByColor = [];
    return;
  }
  plain.variantsByColor = buildVariantsByColor(plain.variants);
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

exports.ProductService = {
  parseProductListQuery,

  create: async (data) => {
    return Model.create(data);
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
          include: [
            {
              model: ProductImage,
              as: "images",
              required: false,
              separate: true,
              order: [["rank", "ASC"]],
            },
          ],
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
          include: [
            {
              model: ProductImage,
              as: "images",
              required: false,
              separate: true,
              order: [["rank", "ASC"]],
            },
          ],
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
