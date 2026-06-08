"use strict";

const Model = require("./model");

exports.CartService = {
  create: (data) => Model.create(data),
  findOne: (conditions) => Model.findOne(conditions),
  findAndCountAll: (conditions) => Model.findAndCountAll(conditions),
  update: (data, conditions) => Model.update(data, conditions),
  remove: (conditions) => Model.destroy(conditions),
};
