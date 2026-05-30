"use strict";

const Joi = require("joi");

const blogFields = {
  title: Joi.string().trim(),
  slug: Joi.string().trim(),
  content: Joi.string(),
  excerpt: Joi.string().allow(null, ""),
  featuredImage: Joi.string().allow(null, ""),
  category: Joi.string().allow(null, ""),
  tags: Joi.string().allow(null, ""),
  status: Joi.string().valid("draft", "published", "archived"),
  isFeatured: Joi.boolean(),
  viewCount: Joi.number().integer(),
  metaTitle: Joi.string().allow(null, ""),
  metaDescription: Joi.string().allow(null, ""),
  published_at: Joi.date().allow(null),
};

module.exports = {
  createValidation: Joi.object()
    .keys({
      ...blogFields,
      title: Joi.string().trim().required(),
      slug: Joi.string().trim().required(),
      content: Joi.string().required(),
      status: Joi.string().valid("draft", "published", "archived").default("draft"),
      isFeatured: Joi.boolean().default(false),
      viewCount: Joi.number().integer().default(0),
    })
    .options({ stripUnknown: true }),
  updateValidation: Joi.object()
    .keys(blogFields)
    .min(1)
    .options({ stripUnknown: true }),
};
