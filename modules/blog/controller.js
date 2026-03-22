"use strict";

const { BlogService } = require("./service");

exports.create = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      authorId: req.user?.id || req.body.authorId
    };
    const data = await BlogService.create(payload);
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
    const data = await BlogService.get({
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
    const data = await BlogService.update(req.body, {
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
    const data = await BlogService.remove({
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
    const data = await BlogService.findAndCountAll({});
    res.status(200).json({
      status: "success",
      data
    });
  } catch (err) {
    next(err);
  }
};

