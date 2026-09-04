'use strict';

const crypto = require('crypto');

const {
  StandardCheckoutClient,
  StandardCheckoutPayRequest,
  Env,
} = require('@phonepe-pg/pg-sdk-node');

const { AppError } = require('../middleware/errorHandler');
const { sanitizeUrl, describeError } = require('../utils/sanitize');

// PhonePe rejects orders below ₹1 and caps merchantOrderId at 63 chars.
const MIN_AMOUNT_PAISE = 100;
const MAX_MERCHANT_ORDER_ID_LENGTH = 63;
const MERCHANT_ORDER_ID_PATTERN = /^[A-Za-z0-9_-]{8,63}$/;

// Terminal order states as returned by the Order Status API.
const STATE_COMPLETED = 'COMPLETED';
const STATE_FAILED = 'FAILED';
const STATE_PENDING = 'PENDING';

let client = null;
let clientFingerprint = null;

function getPhonePeClient(env) {
  const fingerprint = [
    env.phonepe.clientId,
    env.phonepe.clientVersion,
    env.phonepe.environment,
  ].join('|');

  if (client && clientFingerprint === fingerprint) return client;

  if (
    !env.phonepe ||
    !env.phonepe.clientId ||
    !env.phonepe.clientSecret ||
    !env.phonepe.clientVersion
  ) {
    throw new AppError(
      'PhonePe credentials are not configured',
      500,
      'PHONEPE_NOT_CONFIGURED'
    );
  }

  const phonePeEnv =
    env.phonepe.environment === 'production' ? Env.PRODUCTION : Env.SANDBOX;

  client = StandardCheckoutClient.getInstance(
    env.phonepe.clientId,
    env.phonepe.clientSecret,
    env.phonepe.clientVersion,
    phonePeEnv
  );

  clientFingerprint = fingerprint;

  return client;
}

function parseAmountToPaise(amount) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new AppError(
      'Amount must be a positive number',
      400,
      'INVALID_AMOUNT'
    );
  }

  const paise = Math.round(numericAmount * 100);

  if (paise < MIN_AMOUNT_PAISE) {
    throw new AppError(
      'Minimum payable amount is ₹1',
      400,
      'AMOUNT_TOO_SMALL'
    );
  }

  return paise;
}

function createMerchantOrderId() {
  return `DG_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
}

function assertValidMerchantOrderId(merchantOrderId) {
  const id = String(merchantOrderId || '').trim();

  if (!id) {
    throw new AppError(
      'merchantOrderId is required',
      400,
      'MERCHANT_ORDER_ID_REQUIRED'
    );
  }

  if (id.length > MAX_MERCHANT_ORDER_ID_LENGTH) {
    throw new AppError(
      `merchantOrderId must be at most ${MAX_MERCHANT_ORDER_ID_LENGTH} characters`,
      400,
      'MERCHANT_ORDER_ID_TOO_LONG'
    );
  }

  if (!MERCHANT_ORDER_ID_PATTERN.test(id)) {
    throw new AppError(
      'merchantOrderId format is invalid',
      400,
      'MERCHANT_ORDER_ID_INVALID'
    );
  }

  return id;
}

/**
 * PhonePe renders the checkout page inside the merchant's registered domain
 * context, so the redirect target must be one we control. Resolving against
 * an allowlist also prevents this endpoint from becoming an open redirect.
 */
function resolveRedirectUrl(env, requestedRedirectUrl, merchantOrderId) {
  const configured = String(env.phonepe.redirectUrl || '').trim();

  // Production always returns customers to the dashboard-whitelisted URL.
  // Sandbox may honour a same-origin request from the local test harness.
  const requested =
    env.phonepe.environment === 'production'
      ? ''
      : String(requestedRedirectUrl || '').trim();

  const chosen = requested || configured;

  if (!chosen) {
    throw new AppError(
      'PhonePe redirect URL is not configured',
      500,
      'PHONEPE_REDIRECT_URL_MISSING'
    );
  }

  let url;

  try {
    url = new URL(chosen);
  } catch (_err) {
    throw new AppError(
      'PhonePe redirect URL must be an absolute http(s) URL',
      500,
      'PHONEPE_REDIRECT_URL_INVALID'
    );
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new AppError(
      'PhonePe redirect URL must use http or https',
      500,
      'PHONEPE_REDIRECT_URL_INVALID'
    );
  }

  if (env.phonepe.environment === 'production' && url.protocol !== 'https:') {
    throw new AppError(
      'PhonePe production redirect URL must use https',
      500,
      'PHONEPE_REDIRECT_URL_INVALID'
    );
  }

  if (requested) {
    const allowed = env.phonepe.allowedRedirectOrigins || [];

    if (!allowed.includes(url.origin)) {
      throw new AppError(
        'Requested redirect URL is not allowed',
        400,
        'REDIRECT_URL_NOT_ALLOWED'
      );
    }
  }

  // The return page needs to know which order to verify server-side.
  url.searchParams.set('merchantOrderId', merchantOrderId);
  url.searchParams.set('gateway', 'phonepe');

  return url.toString();
}

async function createPayment(env, payload = {}) {
  const amountPaise = parseAmountToPaise(payload.amount);

  const maxPaise = Math.round(Number(env.maxOrderAmountInr || 100000) * 100);

  if (amountPaise > maxPaise) {
    throw new AppError(
      `Amount exceeds maximum allowed (₹${env.maxOrderAmountInr})`,
      400,
      'AMOUNT_TOO_LARGE'
    );
  }

  const merchantOrderId = payload.merchantOrderId
    ? assertValidMerchantOrderId(payload.merchantOrderId)
    : createMerchantOrderId();

  const redirectUrl = resolveRedirectUrl(
    env,
    payload.redirectUrl,
    merchantOrderId
  );

  const builder = StandardCheckoutPayRequest.builder()
    .merchantOrderId(merchantOrderId)
    .amount(amountPaise)
    .redirectUrl(redirectUrl);

  if (Number.isInteger(env.phonepe.expireAfterSeconds)) {
    builder.expireAfter(env.phonepe.expireAfterSeconds);
  }

  const request = builder.build();

  const phonepe = getPhonePeClient(env);

  console.info('[phonepe] create-payment requested', {
    merchantOrderId,
    amountPaise,
    environment: env.phonepe.environment,
    redirectUrl: sanitizeUrl(redirectUrl),
  });

  try {
    const response = await phonepe.pay(request);

    if (!response || !response.redirectUrl) {
      throw new AppError(
        'PhonePe did not return a checkout URL',
        502,
        'PHONEPE_CHECKOUT_URL_MISSING'
      );
    }

    console.info('[phonepe] create-payment succeeded', {
      merchantOrderId,
      orderId: response.orderId,
      state: response.state,
      expireAt: response.expireAt,
      checkoutHost: sanitizeUrl(response.redirectUrl),
    });

    return {
      merchantOrderId,
      orderId: response.orderId || null,
      state: response.state || STATE_PENDING,
      expireAt: response.expireAt || null,
      amount: amountPaise,
      redirectUrl: response.redirectUrl,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;

    const described = describeError(err);

    console.error('[phonepe] create-payment failed', {
      merchantOrderId,
      environment: env.phonepe.environment,
      ...described,
    });

    throw new AppError(
      'Failed to create PhonePe payment',
      502,
      'PHONEPE_PAYMENT_FAILED',
      described
    );
  }
}

/**
 * Server-side source of truth for whether an order was paid.
 * Never infer success from the browser returning to the site.
 */
async function getPaymentStatus(env, merchantOrderId, options = {}) {
  const orderId = assertValidMerchantOrderId(merchantOrderId);

  const phonepe = getPhonePeClient(env);

  try {
    const response = await phonepe.getOrderStatus(
      orderId,
      Boolean(options.details)
    );

    const state = response && response.state ? String(response.state) : 'UNKNOWN';

    console.info('[phonepe] order-status', {
      merchantOrderId: orderId,
      state,
      phonepeOrderId: response && response.orderId,
    });

    return {
      merchantOrderId: orderId,
      orderId: (response && response.orderId) || null,
      state,
      amount: (response && response.amount) || 0,
      expireAt: (response && response.expireAt) || null,
      errorCode: (response && response.errorCode) || null,
      detailedErrorCode: (response && response.detailedErrorCode) || null,
      paymentDetails:
        response && Array.isArray(response.paymentDetails)
          ? response.paymentDetails
          : [],
    };
  } catch (err) {
    if (err instanceof AppError) throw err;

    const described = describeError(err);

    console.error('[phonepe] order-status failed', {
      merchantOrderId: orderId,
      environment: env.phonepe.environment,
      ...described,
    });

    throw new AppError(
      'Failed to get PhonePe payment status',
      502,
      'PHONEPE_STATUS_FAILED',
      described
    );
  }
}

/**
 * Verify a PhonePe webhook using the dashboard-configured credentials.
 * Throws when the callback cannot be trusted.
 */
function validateWebhook(env, authorizationHeader, rawBody) {
  const username = env.phonepe.webhookUsername;
  const password = env.phonepe.webhookPassword;

  if (!username || !password) {
    throw new AppError(
      'PhonePe webhook credentials are not configured',
      500,
      'PHONEPE_WEBHOOK_NOT_CONFIGURED'
    );
  }

  if (!authorizationHeader) {
    throw new AppError(
      'Missing PhonePe webhook authorization header',
      401,
      'PHONEPE_WEBHOOK_UNAUTHORIZED'
    );
  }

  const phonepe = getPhonePeClient(env);

  try {
    return phonepe.validateCallback(
      username,
      password,
      authorizationHeader,
      rawBody
    );
  } catch (err) {
    console.error('[phonepe] webhook validation failed', describeError(err));

    throw new AppError(
      'Invalid PhonePe webhook signature',
      401,
      'PHONEPE_WEBHOOK_INVALID'
    );
  }
}

function isPaidState(state) {
  return String(state || '').toUpperCase() === STATE_COMPLETED;
}

function isTerminalState(state) {
  const normalized = String(state || '').toUpperCase();
  return normalized === STATE_COMPLETED || normalized === STATE_FAILED;
}

module.exports = {
  MIN_AMOUNT_PAISE,
  STATE_COMPLETED,
  STATE_FAILED,
  STATE_PENDING,
  getPhonePeClient,
  createMerchantOrderId,
  assertValidMerchantOrderId,
  parseAmountToPaise,
  createPayment,
  getPaymentStatus,
  validateWebhook,
  isPaidState,
  isTerminalState,
};
