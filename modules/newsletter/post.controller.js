"use strict";

const { NewsletterPostService } = require("./post.service");
const { parseNewsletterPostListQuery } = require("./post.listQuery");
const { buildPaginatedResponse } = require("../../middleware/listPagination");
const {
  EDITORIAL_AUTHOR_INCLUDE,
  flattenAuthor,
  flattenAuthorList,
} = require("../../lib/editorialAuthor");

function buildPayload(body, isUpdate = false) {
  const payload = {};
  if (body.title !== undefined) payload.title = String(body.title).trim();
  if (body.slug !== undefined) payload.slug = String(body.slug).trim();
  if (body.content !== undefined) payload.content = String(body.content);
  if (body.excerpt !== undefined) payload.excerpt = String(body.excerpt ?? "");
  if (body.featuredImage !== undefined && String(body.featuredImage).trim() !== "") {
    payload.featuredImage = String(body.featuredImage).trim();
  }
  if (body.status !== undefined) payload.status = String(body.status);
  if (body.published_at !== undefined && body.published_at !== "") {
    payload.published_at = body.published_at;
  } else if (body.published_at === null || body.published_at === "") {
    payload.published_at = null;
  }
  if (!isUpdate && payload.status === undefined) payload.status = "draft";
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
    if (!req.user?.id) {
      return res.status(401).json({ status: 401, message: "Authentication required" });
    }
    payload.authorId = req.user.id;

    const data = await NewsletterPostService.create(payload);
    return res.status(201).json({
      status: 201,
      message: "Newsletter post created successfully",
      data,
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ status: 409, message: "Slug already exists" });
    }
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ status: 400, message: "Invalid newsletter post id" });
    }
    const data = await NewsletterPostService.findOne({ where: { id } });
    if (!data) {
      return res.status(404).json({ status: 404, message: "Newsletter post not found" });
    }
    if (data.status !== "published") {
      return res.status(404).json({ status: 404, message: "Newsletter post not found" });
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
      return res.status(400).json({ status: 400, message: "Invalid newsletter slug" });
    }
    const data = await NewsletterPostService.findOne({
      where: { slug, status: "published" },
      include: [EDITORIAL_AUTHOR_INCLUDE],
    });
    if (!data) {
      return res.status(404).json({ status: 404, message: "Newsletter post not found" });
    }
    return res.status(200).json({ status: 200, data: flattenAuthor(data) });
  } catch (err) {
    next(err);
  }
};

exports.getSlugs = async (req, res, next) => {
  try {
    const rows = await NewsletterPostService.get({
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
    const [affected] = await NewsletterPostService.update(payload, { where: { id } });
    if (!affected) {
      return res.status(404).json({ status: 404, message: "Newsletter post not found" });
    }
    const data = await NewsletterPostService.findOne({ where: { id } });
    return res.status(200).json({
      status: 200,
      message: "Newsletter post updated successfully",
      data,
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ status: 409, message: "Slug already exists" });
    }
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const deleted = await NewsletterPostService.remove({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ status: 404, message: "Newsletter post not found" });
    }
    return res.status(200).json({
      status: 200,
      message: "Newsletter post deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { where, order, limit, offset, page } = parseNewsletterPostListQuery(req.query, {
      publicOnly: true,
    });
    const result = await NewsletterPostService.findAndCountAll({
      where,
      order,
      limit,
      offset,
      distinct: true,
      include: [EDITORIAL_AUTHOR_INCLUDE],
    });
    const count =
      typeof result?.count === "number"
        ? result.count
        : Array.isArray(result?.count)
          ? result.count.length
          : 0;
    const body = buildPaginatedResponse(
      { count, rows: flattenAuthorList(result?.rows ?? []) },
      page,
      limit,
      count === 0 ? "No newsletter posts found" : "Newsletter posts fetched successfully"
    );
    return res.status(200).json(body);
  } catch (err) {
    next(err);
  }
};
