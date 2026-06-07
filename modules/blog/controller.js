"use strict";

const { BlogService } = require("./service");
const { parseBlogListQuery } = require("./listQuery");
const { buildPaginatedResponse } = require("../../middleware/listPagination");

function coerceBool(val) {
  if (val === true || val === "true" || val === 1 || val === "1") return true;
  if (val === false || val === "false" || val === 0 || val === "0") return false;
  return undefined;
}

function buildPayload(body, isUpdate = false) {
  const payload = {};

  if (body.title !== undefined) payload.title = String(body.title).trim();
  if (body.slug !== undefined) payload.slug = String(body.slug).trim();
  if (body.content !== undefined) payload.content = String(body.content);
  if (body.excerpt !== undefined) payload.excerpt = String(body.excerpt ?? "");
  if (body.featuredImage !== undefined && String(body.featuredImage).trim() !== "") {
    payload.featuredImage = String(body.featuredImage).trim();
  }
  if (body.category !== undefined) payload.category = String(body.category ?? "");
  if (body.tags !== undefined) payload.tags = String(body.tags ?? "");
  if (body.status !== undefined) payload.status = String(body.status);
  if (body.metaTitle !== undefined) payload.metaTitle = String(body.metaTitle ?? "");
  if (body.metaDescription !== undefined) {
    payload.metaDescription = String(body.metaDescription ?? "");
  }
  if (body.published_at !== undefined && body.published_at !== "") {
    payload.published_at = body.published_at;
  }

  const isFeatured = coerceBool(body.isFeatured);
  if (isFeatured !== undefined) payload.isFeatured = isFeatured;

  if (body.viewCount !== undefined && body.viewCount !== "") {
    const n = parseInt(body.viewCount, 10);
    if (!Number.isNaN(n)) payload.viewCount = n;
  }

  if (!isUpdate) {
    if (payload.status === undefined) payload.status = "draft";
    if (payload.isFeatured === undefined) payload.isFeatured = false;
    if (payload.viewCount === undefined) payload.viewCount = 0;
  }

  return payload;
}

exports.create = async (req, res, next) => {
  try {
    const payload = buildPayload(req.body, false);
    if (!payload.title || !payload.slug || !payload.content) {
      return res.status(400).json({
        status: 400,
        message: "title, slug, and content are required",
      });
    }
    if (req.user?.accountType === "staff") {
      payload.authorId = req.user.id;
    } else if (req.body.authorId !== undefined) {
      payload.authorId = parseInt(req.body.authorId, 10);
    }
    if (!payload.authorId || Number.isNaN(payload.authorId)) {
      return res.status(400).json({
        status: 400,
        message: "authorId could not be determined",
      });
    }
    const data = await BlogService.create(payload);
    return res.status(201).json({
      status: 201,
      message: "Blog created successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ status: 400, message: "Invalid blog id" });
    }
    const data = await BlogService.findOne({ where: { id } });
    if (!data) {
      return res.status(404).json({ status: 404, message: "Blog not found" });
    }
    return res.status(200).json({ status: 200, data });
  } catch (err) {
    next(err);
  }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const slug = String(req.params.slug || "").trim();
    if (!slug) {
      return res.status(400).json({ status: 400, message: "Invalid blog slug" });
    }
    const data = await BlogService.findOne({
      where: { slug, status: "published" },
    });
    if (!data) {
      return res.status(404).json({ status: 404, message: "Blog not found" });
    }
    return res.status(200).json({ status: 200, data });
  } catch (err) {
    next(err);
  }
};

exports.getSlugs = async (req, res, next) => {
  try {
    const rows = await BlogService.get({
      where: { status: "published" },
      attributes: ["slug"],
      order: [["published_at", "DESC"]],
    });
    return res.status(200).json({
      status: 200,
      data: rows.map((row) => row.slug).filter(Boolean),
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const payload = buildPayload(req.body, true);
    const [affected] = await BlogService.update(payload, { where: { id } });
    if (!affected) {
      return res.status(404).json({ status: 404, message: "Blog not found" });
    }
    const data = await BlogService.findOne({ where: { id } });
    return res.status(200).json({
      status: 200,
      message: "Blog updated successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const deleted = await BlogService.remove({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ status: 404, message: "Blog not found" });
    }
    return res.status(200).json({
      status: 200,
      message: "Blog deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { where, order, limit, offset, page } = parseBlogListQuery(req.query);
    const data = await BlogService.findAndCountAll({
      where,
      order,
      limit,
      offset,
    });
    const body = buildPaginatedResponse(
      data,
      page,
      limit,
      data?.count === 0 ? "No blogs found" : "Blogs fetched successfully"
    );
    return res.status(200).json(body);
  } catch (err) {
    next(err);
  }
};
