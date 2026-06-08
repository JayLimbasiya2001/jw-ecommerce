"use strict";

/**
 * GoKwik checkout / payments (see Woo plugin: gokwik-checkout.php).
 * Credentials: Merchant Dashboard → Account (App ID, App Secret, Merchant ID).
 */
const ENV_BASE_URLS = {
  DEV: "https://api-gw-v4.dev.gokwik.io/dev/",
  QA: "https://api-gw-v4.dev.gokwik.io/qa/",
  SANDBOX: "https://api-gw-v4.dev.gokwik.io/sandbox/",
  PRODUCTION: "https://gkx.gokwik.co/",
};

const ENV_SCRIPT_URLS = {
  DEV: "https://dev.pdp.gokwik.co/v4/build/gokwik.js",
  QA: "https://qa.pdp.gokwik.co/v4/build/gokwik.js",
  SANDBOX: "https://sandbox.pdp.gokwik.co/v4/build/gokwik.js",
  PRODUCTION: "https://pdp.gokwik.co/v4/build/gokwik.js",
};

const ENV_RTO_BASE_URLS = {
  DEV: "https://sandbox.gokwik.co/",
  QA: "https://sandbox.gokwik.co/",
  SANDBOX: "https://sandbox.gokwik.co/",
  PRODUCTION: "https://api.gokwik.co/",
};

function normalizeEnv(raw) {
  const key = String(raw || "SANDBOX").trim().toUpperCase();
  return ENV_BASE_URLS[key] ? key : "SANDBOX";
}

function getGokwikConfig() {
  const env = normalizeEnv(process.env.GOKWIK_ENV);
  const apiBase =
    process.env.GOKWIK_API_BASE_URL?.trim() ||
    ENV_BASE_URLS[env] ||
    ENV_BASE_URLS.SANDBOX;

  const enabled =
    process.env.GOKWIK_ENABLED === "true" ||
    process.env.GOKWIK_ENABLED === "1";

  const mockCheckout =
    process.env.GOKWIK_MOCK_CHECKOUT === "true" ||
    process.env.GOKWIK_MOCK_CHECKOUT === "1";

  return {
    enabled,
    env,
    isProduction: env === "PRODUCTION",
    appId: process.env.GOKWIK_APP_ID?.trim() || "",
    appSecret: process.env.GOKWIK_APP_SECRET?.trim() || "",
    merchantId: process.env.GOKWIK_MERCHANT_ID?.trim() || "",
    webhookSecret: process.env.GOKWIK_WEBHOOK_SECRET?.trim() || "",
    apiBaseUrl: apiBase.endsWith("/") ? apiBase : `${apiBase}/`,
    scriptUrl: ENV_SCRIPT_URLS[env] || ENV_SCRIPT_URLS.SANDBOX,
    rtoBaseUrl: ENV_RTO_BASE_URLS[env] || ENV_RTO_BASE_URLS.SANDBOX,
    rtoEnabled:
      process.env.GOKWIK_RTO_ENABLED === "true" ||
      process.env.GOKWIK_RTO_ENABLED === "1",
    mockCheckout,
    appUrl: (process.env.APP_URL || process.env.API_URL || "http://localhost:4000").replace(
      /\/$/,
      ""
    ),
    frontendUrl: (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, ""),
  };
}

function assertGokwikConfigured(config = getGokwikConfig()) {
  if (!config.enabled) {
    const err = new Error("GoKwik payments are disabled");
    err.statusCode = 503;
    throw err;
  }
  if (!config.appId || !config.appSecret) {
    const err = new Error("GoKwik credentials are not configured (GOKWIK_APP_ID / GOKWIK_APP_SECRET)");
    err.statusCode = 503;
    throw err;
  }
  return config;
}

module.exports = {
  getGokwikConfig,
  assertGokwikConfigured,
  ENV_BASE_URLS,
};
