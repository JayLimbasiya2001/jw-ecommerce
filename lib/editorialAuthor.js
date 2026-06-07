"use strict";

const userModel = require("../modules/user/model");

const EDITORIAL_AUTHOR_INCLUDE = {
  model: userModel,
  attributes: ["id", "name"],
  required: false,
};

function flattenAuthor(row) {
  if (!row) return row;
  const data = typeof row.toJSON === "function" ? row.toJSON() : { ...row };
  if (data.user) {
    data.author = {
      id: data.user.id,
      name: data.user.name,
    };
    delete data.user;
  }
  return data;
}

function flattenAuthorList(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(flattenAuthor);
}

module.exports = {
  EDITORIAL_AUTHOR_INCLUDE,
  flattenAuthor,
  flattenAuthorList,
};
