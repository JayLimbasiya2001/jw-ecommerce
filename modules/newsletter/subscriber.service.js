"use strict";

const Model = require("./subscriber.model");

exports.NewsletterSubscriberService = {
  create: (data) => Model.create(data),
  findOne: (conditions) => Model.findOne(conditions),
  findAndCountAll: (conditions) => Model.findAndCountAll(conditions),
  update: (data, conditions) => Model.update(data, conditions),
  remove: (conditions) => Model.destroy(conditions),
};
