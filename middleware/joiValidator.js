"use strict";

/**
 * @param {Joi.ObjectSchema} schema - Joi schema for req.body
 * @param {{ example?: object }} options - optional example body (e.g. for register)
 */
const joiValidator = (schema, options = {}) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const details = error.details.map((d) =>
        d.message.replace(/\\"/g, "").replace(/"([^"]*)"/g, "$1")
      );
      const response = {
        status: 400,
        message: "Validation error",
        details
      };
      if (options.example) {
        response.example = options.example;
      }
      return res.status(response.status).json(response);
    }

    req.body = value;
    next();
  };
};

module.exports = { joiValidator };

