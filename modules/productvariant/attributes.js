"use strict";

const Attribute = require("../attribute/model");
const AttributeValue = require("../attributevalue/model");
const VariantAttribute = require("../variantattribute/model");
const Productvariant = require("./model");

function slugKey(input) {
  const s = String(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
  return s || "attr";
}

async function findOrCreateAttributeByKey(key, displayName) {
  const k = slugKey(key);
  const name = (displayName && String(displayName).trim()) || k;
  const [row] = await Attribute.findOrCreate({
    where: { key: k },
    defaults: {
      key: k,
      name,
      isActive: true,
      sortOrder: 0,
    },
  });
  if (name && row.name !== name) {
    await row.update({ name });
  }
  return row;
}

async function findOrCreateAttributeValue(attributeId, rawValue) {
  const v = String(rawValue ?? "").trim();
  if (!v) return null;
  const [row] = await AttributeValue.findOrCreate({
    where: { attributeId, value: v },
    defaults: {
      attributeId,
      value: v,
      sortOrder: 0,
    },
  });
  return row;
}

/**
 * Build [{ attributeId, attributeValueId }] from { color: "red", size: "M" } (creates rows as needed).
 */
async function pairsFromAttributesObject(obj) {
  if (!obj || typeof obj !== "object") return { ok: true, pairs: [] };
  const pairs = [];
  for (const [k, raw] of Object.entries(obj)) {
    if (raw === undefined || raw === null) continue;
    const attr = await findOrCreateAttributeByKey(k, k);
    const val = await findOrCreateAttributeValue(attr.id, raw);
    if (val) {
      pairs.push({ attributeId: attr.id, attributeValueId: val.id });
    }
  }
  const seen = new Set();
  for (const p of pairs) {
    if (seen.has(p.attributeId)) {
      return {
        ok: false,
        message: `Duplicate attribute in payload (attributeId ${p.attributeId})`,
      };
    }
    seen.add(p.attributeId);
  }
  return { ok: true, pairs };
}

async function pairsFromAttributeValueIds(ids) {
  if (!ids || ids.length === 0) return { ok: true, pairs: [] };
  const unique = [...new Set(ids.map((x) => parseInt(x, 10)).filter((n) => !Number.isNaN(n)))];
  const rows = await AttributeValue.findAll({
    where: { id: unique },
    include: [{ model: Attribute, as: "attribute", required: true }],
  });
  if (rows.length !== unique.length) {
    return { ok: false, message: "One or more attributeValueIds are invalid" };
  }
  const typeSeen = new Set();
  const pairs = [];
  for (const r of rows) {
    if (typeSeen.has(r.attributeId)) {
      return {
        ok: false,
        message: "Only one attribute value per attribute type is allowed per variant",
      };
    }
    typeSeen.add(r.attributeId);
    pairs.push({
      attributeId: r.attributeId,
      attributeValueId: r.id,
    });
  }
  return { ok: true, pairs };
}

async function mergeAttributePairs(body = {}) {
  const rawIds = body.attributeValueIds;
  const ids = Array.isArray(rawIds) ? rawIds : [];
  const fromIds = await pairsFromAttributeValueIds(ids);
  if (!fromIds.ok) return fromIds;
  const fromObj = await pairsFromAttributesObject(body.attributes);
  if (!fromObj.ok) return fromObj;

  const byAttr = new Map();
  for (const p of fromIds.pairs) {
    byAttr.set(p.attributeId, p);
  }
  for (const p of fromObj.pairs) {
    byAttr.set(p.attributeId, p);
  }
  const merged = Array.from(byAttr.values()).sort((a, b) => a.attributeId - b.attributeId);
  return { ok: true, pairs: merged };
}

function signatureFromPairs(pairs) {
  return pairs
    .map((p) => `${p.attributeId}:${p.attributeValueId}`)
    .sort()
    .join("|");
}

async function findVariantWithSameSignature(productId, pairs, excludeVariantId, transaction) {
  if (!pairs.length) return null;
  const sig = signatureFromPairs(pairs);
  const siblings = await Productvariant.findAll({
    where: { productId },
    attributes: ["id"],
    transaction,
    include: [
      {
        model: VariantAttribute,
        as: "variantAttributes",
        required: false,
        attributes: ["attributeId", "attributeValueId"],
      },
    ],
  });
  for (const v of siblings) {
    if (excludeVariantId != null && v.id === excludeVariantId) continue;
    const vp = (v.variantAttributes || []).map((row) => ({
      attributeId: row.attributeId,
      attributeValueId: row.attributeValueId,
    }));
    if (signatureFromPairs(vp) === sig) return v;
  }
  return null;
}

async function displayNameFromPairs(pairs, fallbackSku) {
  if (!pairs.length) return fallbackSku || "Variant";
  const vals = await AttributeValue.findAll({
    where: { id: pairs.map((p) => p.attributeValueId) },
    include: [{ model: Attribute, as: "attribute", attributes: ["key"] }],
  });
  const byId = new Map(vals.map((v) => [v.id, v]));
  const label = pairs
    .map((p) => byId.get(p.attributeValueId)?.value)
    .filter(Boolean)
    .join(" / ");
  return label || fallbackSku || "Variant";
}

/**
 * Create / update: which attribute pairs to persist.
 * On PATCH, if neither `attributes` nor `attributeValueIds` is sent, keep existing rows.
 */
async function resolvePairsForPersist(body, currentInstance, isUpdate) {
  const hasExplicit =
    body &&
    (Object.prototype.hasOwnProperty.call(body, "attributes") ||
      Object.prototype.hasOwnProperty.call(body, "attributeValueIds"));
  if (isUpdate && currentInstance && !hasExplicit) {
    const rows = await VariantAttribute.findAll({
      where: { variantId: currentInstance.id },
      attributes: ["attributeId", "attributeValueId"],
    });
    const pairs = rows.map((r) => ({
      attributeId: r.attributeId,
      attributeValueId: r.attributeValueId,
    }));
    return { ok: true, pairs };
  }
  return mergeAttributePairs(body || {});
}

async function replaceVariantAttributes(variantId, pairs, transaction) {
  await VariantAttribute.destroy({
    where: { variantId },
    force: true,
    transaction,
  });
  if (!pairs.length) return;
  await VariantAttribute.bulkCreate(
    pairs.map((p) => ({
      variantId,
      attributeId: p.attributeId,
      attributeValueId: p.attributeValueId,
    })),
    { transaction }
  );
}

/** Keys reserved on each variant row; any other key is treated as a dynamic attribute (color, size, …). */
const VARIANT_BODY_RESERVED = new Set([
  "sku",
  "price",
  "stock",
  "name",
  "isActive",
  "image",
  "attributeValueIds",
  "attributes",
]);

/**
 * Supports shorthand `{ "color": "red", "size": "M" }` or nested `{ attributes: {...}, sku, price }`.
 * Nested `attributes` + same-name keys on the root: root wins.
 */
function splitVariantCreateItem(item) {
  const meta = {};
  const nested =
    item && item.attributes && typeof item.attributes === "object"
      ? { ...item.attributes }
      : {};
  const flatAttr = {};
  if (!item || typeof item !== "object") {
    return { meta, attributesForPairs: nested };
  }
  for (const [k, v] of Object.entries(item)) {
    if (k === "attributes") continue;
    if (VARIANT_BODY_RESERVED.has(k)) meta[k] = v;
    else flatAttr[k] = v;
  }
  const attributesForPairs = { ...nested, ...flatAttr };
  return { meta, attributesForPairs };
}

/** Flat map `{ key: display value }` for JSON responses */
function variantPlainToAttributesMap(plainVariant) {
  const map = {};
  const rows = plainVariant.variantAttributes;
  if (!Array.isArray(rows)) return map;
  for (const va of rows) {
    const key = va.attribute?.key ?? va.attribute?.name;
    const val = va.attributeValue?.value;
    if (key && val != null) {
      map[key] = val;
    }
  }
  return map;
}

function attachAttributesMapToVariant(plainVariant) {
  if (!plainVariant || typeof plainVariant !== "object") return plainVariant;
  plainVariant.attributes = variantPlainToAttributesMap(plainVariant);
  return plainVariant;
}

function getColorGroupKeyFromVariant(plainVariant) {
  const m = plainVariant.attributes || variantPlainToAttributesMap(plainVariant);
  const c =
    m.color ??
    m.Color ??
    (plainVariant.variantAttributes || []).find(
      (va) =>
        va.attribute &&
        String(va.attribute.key).toLowerCase() === "color"
    )?.attributeValue?.value;
  return c != null && String(c).trim() !== "" ? String(c).trim() : "";
}

function getSizeSortValueFromVariant(plainVariant) {
  const m = plainVariant.attributes || variantPlainToAttributesMap(plainVariant);
  const s =
    m.size ??
    m.Size ??
    (plainVariant.variantAttributes || []).find(
      (va) =>
        va.attribute &&
        String(va.attribute.key).toLowerCase() === "size"
    )?.attributeValue?.value;
  return s ?? "";
}

module.exports = {
  slugKey,
  findOrCreateAttributeByKey,
  findOrCreateAttributeValue,
  pairsFromAttributesObject,
  pairsFromAttributeValueIds,
  mergeAttributePairs,
  resolvePairsForPersist,
  signatureFromPairs,
  findVariantWithSameSignature,
  replaceVariantAttributes,
  displayNameFromPairs,
  variantPlainToAttributesMap,
  attachAttributesMapToVariant,
  getColorGroupKeyFromVariant,
  getSizeSortValueFromVariant,
  VARIANT_BODY_RESERVED,
  splitVariantCreateItem,
};
