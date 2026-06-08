"use strict";

const { getGokwikConfig, assertGokwikConfigured } = require("../../config/gokwik");

function httpError(message, statusCode = 502, details) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.details = details;
  return err;
}

async function gokwikRequest(path, { method = "POST", body } = {}) {
  const config = assertGokwikConfigured();
  const url = `${config.apiBaseUrl}${path.replace(/^\//, "")}`;

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "gk-app-id": config.appId,
    "gk-app-secret": config.appSecret,
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw httpError(
      data?.message || data?.error || `GoKwik API error (${res.status})`,
      res.status >= 400 && res.status < 500 ? res.status : 502,
      data
    );
  }

  return data;
}

/** Register / sync order with GoKwik before opening checkout (v3). */
async function createGokwikOrder(payload) {
  const config = getGokwikConfig();
  if (config.mockCheckout) {
    return {
      status: "success",
      mock: true,
      merchant_order_id: payload.merchant_order_id,
      order_id: `mock_gk_${payload.merchant_order_id}`,
      message: "Mock GoKwik create order (dev)",
      data: payload,
    };
  }
  return gokwikRequest("v3/orders/create", { body: payload });
}

/** Notify GoKwik of order status / AWB updates. */
async function updateGokwikOrder(payload) {
  const config = getGokwikConfig();
  if (config.mockCheckout) {
    return { status: "success", mock: true };
  }
  return gokwikRequest("v3/orders/update", { body: payload });
}

/** Optional RTO check before showing payment methods. */
async function predictRto(payload) {
  const config = getGokwikConfig();
  if (!config.rtoEnabled) return null;

  const url = `${config.rtoBaseUrl.replace(/\/$/, "")}/v2/rto/predict`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      appid: config.appId,
      appsecret: config.appSecret,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    throw httpError(data?.message || "GoKwik RTO API error", res.status, data);
  }
  return data;
}

module.exports = {
  gokwikRequest,
  createGokwikOrder,
  updateGokwikOrder,
  predictRto,
};
