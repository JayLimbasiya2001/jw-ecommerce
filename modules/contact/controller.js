"use strict";

const { ContactService } = require("./service");
const { sendContactNotification } = require("../../lib/mail/sendContactNotification");
const { buildPaginatedResponse } = require("../../middleware/listPagination");

exports.submit = async (req, res, next) => {
  try {
    const payload = {
      name: String(req.body.name).trim(),
      email: String(req.body.email).trim().toLowerCase(),
      phone: req.body.phone ? String(req.body.phone).trim() : null,
      message: String(req.body.message).trim(),
      status: "new",
    };

    const data = await ContactService.create(payload);
    await sendContactNotification(data);

    return res.status(201).json({
      status: 201,
      message: "Your message has been sent successfully",
      data: { id: data.id },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const offset = (page - 1) * limit;

    const result = await ContactService.findAndCountAll({
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    const body = buildPaginatedResponse(
      result,
      page,
      limit,
      result.count === 0 ? "No contact inquiries found" : "Contact inquiries fetched"
    );
    return res.status(200).json(body);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ status: 400, message: "Invalid inquiry id" });
    }
    const data = await ContactService.findOne({ where: { id } });
    if (!data) {
      return res.status(404).json({ status: 404, message: "Inquiry not found" });
    }
    return res.status(200).json({ status: 200, data });
  } catch (err) {
    next(err);
  }
};
