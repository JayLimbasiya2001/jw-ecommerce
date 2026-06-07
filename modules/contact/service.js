"use strict";

const Model = require("./model");

exports.ContactService = {
  create: async (data) => Model.create(data),
  findAll: async (conditions) => Model.findAll(conditions),
  findAndCountAll: async (conditions) => Model.findAndCountAll(conditions),
  findOne: async (conditions) => Model.findOne(conditions),
};
