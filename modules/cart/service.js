"use strict";

const Model = require("./model");

exports.CartService = {
  create: async (data) => {
    return Model.create(data);
  },

  get: async (conditions) => {
    return Model.findAll(conditions);
  },

  findAndCountAll: async (conditions) => {
    return Model.findAndCountAll(conditions);
  },

  update: async (data, conditions) => {
    return Model.update(data, conditions);
  },

  remove: async (conditions) => {
    return Model.destroy(conditions);
  }
};

