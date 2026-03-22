"use strict";

const { ReviewService } = require("./service");

exports.create = async (req, res, next) => {
  try {
    const data = await ReviewService.create(req.body);
    res.status(201).json({
      status: "success",
      data
    });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const data = await ReviewService.get({
      where: {
        id: req.params.id
      }
    });

    res.status(200).json({
      status: "success",
      data
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = await ReviewService.update(req.body, {
      where: {
        id: req.params.id
      }
    });

    res.status(203).json({
      status: "success",
      data
    });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const data = await ReviewService.remove({
      where: {
        id: req.params.id
      }
    });

    res.status(200).json({
      status: "success",
      data
    });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const data = await ReviewService.findAndCountAll({});

    res.status(200).json({
      status: "success",
      data
    });
  } catch (err) {
    next(err);
  }
};

