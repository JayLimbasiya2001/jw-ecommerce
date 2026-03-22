"use strict";

const { SiteSettingService } = require("./service");

exports.create = async (req, res, next) => {
  try {
    const data = await SiteSettingService.create(req.body);
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
    const data = await SiteSettingService.get({
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
    const data = await SiteSettingService.update(req.body, {
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
    const data = await SiteSettingService.remove({
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
    const data = await SiteSettingService.findAndCountAll({});
    res.status(200).json({
      status: "success",
      data
    });
  } catch (err) {
    next(err);
  }
};

