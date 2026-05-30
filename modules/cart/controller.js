"use strict";

const { CartService } = require("./service");

exports.create = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      customerId: req.user?.id || req.body.customerId
    };
    const data = await CartService.create(payload);
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
    const data = await CartService.get({
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
    const data = await CartService.update(req.body, {
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
    const data = await CartService.remove({
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
    const data = await CartService.findAndCountAll({
      where: {
        customerId: req.user?.id
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

