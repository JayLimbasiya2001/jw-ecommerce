"use strict";

const Model = require("./model");

function stripPassword(row) {
  if (!row) return row;
  const plain = row.get ? row.get({ plain: true }) : { ...row };
  delete plain.password;
  return plain;
}

exports.CustomerService = {
  create: (data) => Model.create(data),
  findOne: (conditions) => Model.findOne(conditions),
  findByEmail: (email) =>
    Model.findOne({ where: { email: String(email).trim().toLowerCase() } }),
  findByIdPlain: async (id) => {
    const row = await Model.findByPk(id);
    return stripPassword(row);
  },
  findAndCountAll: (conditions) => Model.findAndCountAll(conditions),
  update: (data, conditions) => Model.update(data, conditions),
  remove: (conditions) => Model.destroy(conditions),
  stripPassword,
};
