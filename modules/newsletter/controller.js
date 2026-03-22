"use strict";

const { NewsletterService } = require("./service");

exports.create = async (req, res, next) => {
  try {
    const data = await NewsletterService.create(req.body);
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
    const data = await NewsletterService.get({
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
    const data = await NewsletterService.update(req.body, {
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
    const data = await NewsletterService.remove({
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
    const data = await NewsletterService.findAndCountAll({});
    res.status(200).json({
      status: "success",
      data
    });
  } catch (err) {
    next(err);
  }
};

