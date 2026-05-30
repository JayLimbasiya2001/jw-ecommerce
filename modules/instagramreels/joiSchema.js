"use strict";

const Joi = require("joi");

const reelFields = {
  thumbnail: Joi.string().allow(null, ""),
  video: Joi.string().trim(),
  caption: Joi.string().trim(),
  likes: Joi.number().integer(),
  views: Joi.number().integer(),
  isActive: Joi.boolean(),
  rank: Joi.number().integer(),
};

module.exports = {
  createValidation: Joi.object()
    .keys({
      ...reelFields,
      video: Joi.string().trim().required(),
      caption: Joi.string().trim().required(),
      likes: Joi.number().integer().default(0),
      views: Joi.number().integer().default(0),
      isActive: Joi.boolean().default(true),
      rank: Joi.number().integer().default(0),
    })
    .options({ stripUnknown: true }),
  updateValidation: Joi.object()
    .keys(reelFields)
    .min(1)
    .options({ stripUnknown: true }),
};
