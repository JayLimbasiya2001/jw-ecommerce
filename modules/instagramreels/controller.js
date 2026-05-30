"use strict";

const { InstagramreelsService } = require("./service");
const { parseReelsListQuery } = require("./listQuery");
const { buildPaginatedResponse } = require("../../middleware/listPagination");

function coerceBool(val) {
  if (val === true || val === "true" || val === 1 || val === "1") return true;
  if (val === false || val === "false" || val === 0 || val === "0") return false;
  return undefined;
}

function buildPayload(body, isUpdate = false) {
  const payload = {};

  if (body.thumbnail !== undefined && String(body.thumbnail).trim() !== "") {
    payload.thumbnail = String(body.thumbnail).trim();
  }
  if (body.video !== undefined && String(body.video).trim() !== "") {
    payload.video = String(body.video).trim();
  }
  if (body.caption !== undefined) payload.caption = String(body.caption).trim();

  const isActive = coerceBool(body.isActive);
  if (isActive !== undefined) payload.isActive = isActive;

  if (body.likes !== undefined && body.likes !== "") {
    const n = parseInt(body.likes, 10);
    if (!Number.isNaN(n)) payload.likes = n;
  }
  if (body.views !== undefined && body.views !== "") {
    const n = parseInt(body.views, 10);
    if (!Number.isNaN(n)) payload.views = n;
  }
  if (body.rank !== undefined && body.rank !== "") {
    const n = parseInt(body.rank, 10);
    if (!Number.isNaN(n)) payload.rank = n;
  }

  if (!isUpdate) {
    if (payload.likes === undefined) payload.likes = 0;
    if (payload.views === undefined) payload.views = 0;
    if (payload.isActive === undefined) payload.isActive = true;
    if (payload.rank === undefined) payload.rank = 0;
    if (!payload.thumbnail) payload.thumbnail = "";
  }

  return payload;
}

exports.create = async (req, res, next) => {
  try {
    const payload = buildPayload(req.body, false);
    if (!payload.video || !payload.caption) {
      return res.status(400).json({
        status: 400,
        message: "video (link/URL) and caption are required",
      });
    }
    const data = await InstagramreelsService.create(payload);
    return res.status(201).json({
      status: 201,
      message: "Instagram reel created successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const data = await InstagramreelsService.findOne({
      where: { id: req.params.id },
    });
    if (!data) {
      return res.status(404).json({ status: 404, message: "Instagram reel not found" });
    }
    return res.status(200).json({ status: 200, data });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const payload = buildPayload(req.body, true);
    const [affected] = await InstagramreelsService.update(payload, { where: { id } });
    if (!affected) {
      return res.status(404).json({ status: 404, message: "Instagram reel not found" });
    }
    const data = await InstagramreelsService.findOne({ where: { id } });
    return res.status(200).json({
      status: 200,
      message: "Instagram reel updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const deleted = await InstagramreelsService.remove({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ status: 404, message: "Instagram reel not found" });
    }
    return res.status(200).json({
      status: 200,
      message: "Instagram reel deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { where, order, limit, offset, page } = parseReelsListQuery(req.query);

    const result = await InstagramreelsService.findAndCountAll({
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
      count === 0 ? "No instagram reels found" : "Instagram reels fetched successfully"
    );
    return res.status(200).json(body);
  } catch (err) {
    next(err);
  }
};
