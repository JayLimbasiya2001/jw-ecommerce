"use strict";

const { NewsletterSubscriberService } = require("./subscriber.service");
const { parseSubscriberListQuery } = require("./subscriber.listQuery");
const { buildPaginatedResponse } = require("../../middleware/listPagination");

exports.subscribe = async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const name = req.body.name != null ? String(req.body.name).trim() : null;

    const existing = await NewsletterSubscriberService.findOne({ where: { email } });
    if (existing) {
      if (!existing.isActive) {
        await NewsletterSubscriberService.update(
          {
            isActive: true,
            subscribed_at: new Date(),
            unsubscribed_at: null,
            name: name || existing.name,
          },
          { where: { id: existing.id } }
        );
      }
      return res.status(200).json({
        status: 200,
        message: "Already subscribed to newsletter",
      });
    }

    await NewsletterSubscriberService.create({
      email,
      name,
      isActive: true,
      subscribed_at: new Date(),
      isVerified: false,
    });

    return res.status(201).json({
      status: 201,
      message: "Subscribed to newsletter successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { where, order, limit, offset, page } = parseSubscriberListQuery(req.query);
    const result = await NewsletterSubscriberService.findAndCountAll({
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
      count === 0 ? "No subscribers found" : "Newsletter subscribers fetched successfully"
    );
    return res.status(200).json(body);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const data = await NewsletterSubscriberService.findOne({
      where: { id: req.params.id },
    });
    if (!data) {
      return res.status(404).json({ status: 404, message: "Subscriber not found" });
    }
    return res.status(200).json({ status: 200, data });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const deleted = await NewsletterSubscriberService.remove({
      where: { id: req.params.id },
    });
    if (!deleted) {
      return res.status(404).json({ status: 404, message: "Subscriber not found" });
    }
    return res.status(200).json({
      status: 200,
      message: "Subscriber removed successfully",
    });
  } catch (err) {
    next(err);
  }
};
