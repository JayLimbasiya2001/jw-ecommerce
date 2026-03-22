"use strict";

const Joi = require("joi");

module.exports = {
  createValidation: Joi.object().keys({
    authorId: Joi.number().integer().optional(),
    title: Joi.string().required(),
    slug: Joi.string().required(),
    content: Joi.string().required(),
    excerpt: Joi.string().allow(null, ""),
    featuredImage: Joi.string().uri().allow(null, ""),
    category: Joi.string().allow(null, ""),
    tags: Joi.string().allow(null, ""),
    status: Joi.string().valid("draft", "published", "archived").default("draft"),
    isFeatured: Joi.boolean().default(false),
    viewCount: Joi.number().integer().default(0),
    metaTitle: Joi.string().allow(null, ""),
    metaDescription: Joi.string().allow(null, ""),
    published_at: Joi.date().allow(null),
    created_at: Joi.date(),
    updated_at: Joi.date()
  }),
  updateValidation: Joi.object().keys({
    title: Joi.string(),
    slug: Joi.string(),
    content: Joi.string(),
    excerpt: Joi.string().allow(null, ""),
    featuredImage: Joi.string().uri().allow(null, ""),
    category: Joi.string().allow(null, ""),
    tags: Joi.string().allow(null, ""),
    status: Joi.string().valid("draft", "published", "archived"),
    isFeatured: Joi.boolean(),
    viewCount: Joi.number().integer(),
    metaTitle: Joi.string().allow(null, ""),
    metaDescription: Joi.string().allow(null, ""),
    published_at: Joi.date().allow(null),
    created_at: Joi.date(),
    updated_at: Joi.date()
  })
};

