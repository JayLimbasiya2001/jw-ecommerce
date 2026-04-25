"use strict";

const Model = require("./model");
require("../attributevalue/model");

exports.AttributeService = {
  create: async (data) => Model.create(data),
  findAll: async (condition) => Model.findAll(condition),
  update: async (data, condition) => Model.update(data, condition),
  remove: async (condition) => Model.destroy(condition),
  findAndCountAll: async (condition) => Model.findAndCountAll(condition),
  findOne: async (conditions) => Model.findOne(conditions),
};
