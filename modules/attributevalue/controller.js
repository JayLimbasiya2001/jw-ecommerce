"use strict";

const { Op } = require("sequelize");
const { AttributeValueService } = require("./service");
const Attribute = require("../attribute/model");

function buildPayload(body, isUpdate) {
  const payload = {};
  if (body.attributeId !== undefined) {
    const n = parseInt(body.attributeId, 10);
    if (!Number.isNaN(n)) payload.attributeId = n;
  }
  if (body.value !== undefined) payload.value = String(body.value).trim();
  if (body.sortOrder !== undefined) {
    const n = parseInt(body.sortOrder, 10);
    if (!Number.isNaN(n)) payload.sortOrder = n;
  }
  if (!isUpdate && payload.sortOrder === undefined) payload.sortOrder = 0;
  return payload;
}

exports.create = async (req, res) => {
  try {
    const payload = buildPayload(req.body, false);
    if (!payload.attributeId || !payload.value) {
      return res.status(400).json({
        status: 400,
        message: "attributeId and value are required",
      });
    }
    const attr = await Attribute.findByPk(payload.attributeId);
    if (!attr) {
      return res.status(400).json({
        status: 400,
        message: "attributeId does not reference a valid attribute",
      });
    }
    const data = await AttributeValueService.create(payload);
    return res.status(201).json({ status: 201, data });
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
    const data = await AttributeValueService.findOne({
      where: { id: req.params.id },
      include: [{ model: Attribute, as: "attribute", required: false }],
    });
    if (!data) {
      return res.status(404).json({ status: 404, message: "Attribute value not found" });
    }
    return res.status(200).json({ status: 200, data });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err?.message || err,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = buildPayload(req.body, true);
    if (payload.attributeId !== undefined) {
      const attr = await Attribute.findByPk(payload.attributeId);
      if (!attr) {
        return res.status(400).json({
          status: 400,
          message: "attributeId does not reference a valid attribute",
        });
      }
    }
    const [affected] = await AttributeValueService.update(payload, { where: { id } });
    if (!affected) {
      return res.status(404).json({ status: 404, message: "Attribute value not found" });
    }
    const data = await AttributeValueService.findOne({
      where: { id },
      include: [{ model: Attribute, as: "attribute", required: false }],
    });
    return res.status(200).json({ status: 200, data });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err?.message || err,
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await AttributeValueService.remove({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ status: 404, message: "Attribute value not found" });
    }
    return res.status(200).json({
      status: 200,
      message: "Attribute value deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err?.message || err,
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const where = {};
    if (req.query.attributeId != null && req.query.attributeId !== "") {
      const n = parseInt(req.query.attributeId, 10);
      if (!Number.isNaN(n)) where.attributeId = n;
    }
    if (req.query.search != null && String(req.query.search).trim() !== "") {
      const term = `%${String(req.query.search).trim()}%`;
      where.value = { [Op.iLike]: term };
    }
    const data = await AttributeValueService.findAndCountAll({
      where,
      include: [{ model: Attribute, as: "attribute", required: false }],
      order: [
        ["attributeId", "ASC"],
        ["sortOrder", "ASC"],
        ["id", "ASC"],
      ],
    });
    if (!data || (typeof data.count === "number" && data.count === 0)) {
      return res.status(404).json({ status: 404, message: "No attribute values found" });
    }
    return res.status(200).json({
      status: 200,
      message: "Attribute values fetched successfully",
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
