"use strict";

/**
 * Standard success response
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {any} data
 * @param {object} [meta]
 * @param {string} [message]
 */
function sendSuccess(res, statusCode, data, meta, message) {
  let msg = message;
  if (!msg) {
    if (statusCode === 200) msg = "OK";
    else if (statusCode === 201) msg = "Created";
    else if (statusCode === 204) msg = "No Content";
    else msg = "Success";
  }

  const body = {
    status: statusCode,
    message: msg,
    data,
  };

  if (meta && Object.keys(meta).length) {
    body.meta = meta;
  }

  return res.status(statusCode).json(body);
}

/**
 * Standard fail response (4xx)
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {any} [details]
 */
function sendFail(res, statusCode, message, details) {
  const body = {
    status: statusCode,
    message,
  };
  if (details !== undefined) {
    body.details = details;
  }
  return res.status(statusCode).json(body);
}

module.exports = {
  sendSuccess,
  sendFail,
};

