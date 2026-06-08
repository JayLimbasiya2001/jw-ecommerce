"use strict";

const Model = require("./post.model");

exports.NewsletterPostService = {
  create: (data) => Model.create(data),
  get: (conditions) => Model.findAll(conditions),
  findOne: (conditions) => Model.findOne(conditions),
  findAndCountAll: (conditions) => Model.findAndCountAll(conditions),
  update: (data, conditions) => Model.update(data, conditions),
  remove: (conditions) => Model.destroy(conditions),
};
