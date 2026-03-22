"use strict";

const { HerosliderService } = require("./service");

function coerceBool(val) {
  if (val === true || val === "true" || val === 1) return true;
  if (val === false || val === "false" || val === 0) return false;
  return undefined;
}

function buildPayload(body) {
  const now = new Date();
  const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  const image = body.image || "";
  const mobileImage = body.mobileImage || body.image || "";
  const isActive = coerceBool(body.isActive);
  let rank = body.rank;
  if (typeof rank === "string") rank = parseInt(rank, 10);
  if (Number.isNaN(rank)) rank = 0;
  let startDate = body.startDate;
  let endDate = body.endDate;
  if (!startDate) startDate = now;
  else if (typeof startDate === "string") startDate = new Date(startDate);
  if (!endDate) endDate = oneYearLater;
  else if (typeof endDate === "string") endDate = new Date(endDate);
  return {
    title: body.title != null ? String(body.title).trim() : "",
    subTitle: body.subTitle != null ? String(body.subTitle).trim() : "",
    image: image || (mobileImage || ""),
    mobileImage: mobileImage || image || "",
    buttonText: body.buttonText != null ? String(body.buttonText).trim() : "",
    buttonLink: body.buttonLink != null ? String(body.buttonLink).trim() : "",
    isActive: isActive !== undefined ? isActive : true,
    rank: rank !== undefined ? rank : 0,
    startDate,
    endDate,
  };
}

exports.create = async (req, res, next) => {
  try {
    const payload = buildPayload(req.body);
    const data = await HerosliderService.create(payload);
    res.status(201).json({
      status: "success",
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const data = await HerosliderService.get({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const payload = buildPayload(req.body);
    const data = await HerosliderService.update(payload, {
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const data = await HerosliderService.remove({
      where: {
        id: req.params.id
      },
    });
    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const data = await HerosliderService.findAndCountAll({
      // Implement your query logic here if needed
    });

    res.status(200).json({
      status: 200,
      data,
    });
  } catch (err) {
    next(err);
  }
};
