
const Joi = require('joi');

module.exports = {
  createValidation: Joi.object().keys({
    thumbnail: Joi.string(),
    video: Joi.string(),
    caption: Joi.string(),
    likes: Joi.number().integer(),
    views: Joi.number().integer(),
    isActive: Joi.boolean(),
    rank: Joi.number().integer(),
    created_at: Joi.date(),
    updated_at: Joi.date(),
  }),
  updateValidation: Joi.object().keys({
    thumbnail: Joi.string(),
    video: Joi.string(),
    caption: Joi.string(),
    likes: Joi.number().integer(),
    views: Joi.number().integer(),
    isActive: Joi.boolean(),
    rank: Joi.number().integer(),
    created_at: Joi.date(),
    updated_at: Joi.date(),
  })
};
