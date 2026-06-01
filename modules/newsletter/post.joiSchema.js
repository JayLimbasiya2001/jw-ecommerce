"use strict";

const Joi = require("joi");

const postFields = {
  title: Joi.string().trim(),
  slug: Joi.string().trim(),
  excerpt: Joi.string().allow(null, ""),
  content: Joi.string(),
  featuredImage: Joi.string().allow(null, ""),
  status: Joi.string().valid("draft", "published", "archived"),
  published_at: Joi.date().allow(null),
};

module.exports = {
  createValidation: Joi.object()
    .keys({
      ...postFields,
      title: Joi.string().trim().required(),
      slug: Joi.string().trim().required(),
      content: Joi.string().required(),
      status: Joi.string().valid("draft", "published", "archived").default("draft"),
    })
    .options({ stripUnknown: true }),
  updateValidation: Joi.object()
    .keys(postFields)
    .min(1)
    .options({ stripUnknown: true }),
};
