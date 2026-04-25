"use strict";

const { AttributeService } = require("./service");
const { slugKey } = require("../productvariant/attributes");

function buildPayload(body, isUpdate) {
  const payload = {};
  if (body.key !== undefined) payload.key = slugKey(body.key);
  if (body.name !== undefined) payload.name = String(body.name).trim();
  if (body.isActive !== undefined) {
    payload.isActive =
      body.isActive === true ||
      body.isActive === "true" ||
      body.isActive === 1 ||
      body.isActive === "1";
  }
  if (body.sortOrder !== undefined) {
    const n = parseInt(body.sortOrder, 10);
    if (!Number.isNaN(n)) payload.sortOrder = n;
  }
  if (!isUpdate) {
    if (payload.isActive === undefined) payload.isActive = true;
    if (payload.sortOrder === undefined) payload.sortOrder = 0;
  }
  return payload;
}

exports.create = async (req, res) => {
  try {
    const payload = buildPayload(req.body, false);
    if (!payload.key || !payload.name) {
      return res.status(400).json({
        status: 400,
        message: "key and name are required",
      });
    }
    const data = await AttributeService.create(payload);
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
    const data = await AttributeService.findOne({ where: { id: req.params.id } });
    if (!data) {
      return res.status(404).json({ status: 404, message: "Attribute not found" });
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
    const [affected] = await AttributeService.update(payload, { where: { id } });
    if (!affected) {
      return res.status(404).json({ status: 404, message: "Attribute not found" });
    }
    const data = await AttributeService.findOne({ where: { id } });
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
    const deleted = await AttributeService.remove({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ status: 404, message: "Attribute not found" });
    }
    return res.status(200).json({
      status: 200,
      message: "Attribute deleted successfully",
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
    if (req.query.isActive !== undefined && req.query.isActive !== "") {
      const v = req.query.isActive;
      where.isActive = v === "true" || v === true || v === "1" || v === 1;
    }
    const data = await AttributeService.findAndCountAll({
      where,
      order: [
        ["sortOrder", "ASC"],
        ["id", "ASC"],
      ],
    });
    if (!data || (typeof data.count === "number" && data.count === 0)) {
      return res.status(404).json({ status: 404, message: "No attributes found" });
    }
    return res.status(200).json({
      status: 200,
      message: "Attributes fetched successfully",
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
