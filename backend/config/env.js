'use strict';

// ============================================================
// Environment Configuration
// PhonePe is the primary payment gateway.
// Razorpay configuration is kept for compatibility only.
// ============================================================

const requiredAlways = [];
const requiredInProduction = [];

function parseOrigins(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function loadEnv() {
  require('dotenv').config();

  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProd = nodeEnv === 'production';

  // ============================================================
  // Razorpay — compatibility only
  // ============================================================

  const keyId = String(
    process.env.RAZORPAY_KEY_ID || ''
  ).trim();

  const keySecret = String(
    process.env.RAZORPAY_KEY_SECRET || ''
  ).trim();

  const razorpayWebhookSecret = String(
    process.env.RAZORPAY_WEBHOOK_SECRET || ''
  ).trim();

  // Razorpay is not required for backend startup.
  // If old credentials exist, perform basic validation only.
  if (keyId && !keyId.startsWith('rzp_')) {
    throw new Error(
      'RAZORPAY_KEY_ID looks invalid (expected value starting with rzp_)'
    );
  }

  if (keySecret && keySecret.startsWith('rzp_')) {
    throw new Error(
      'RAZORPAY_KEY_SECRET appears to be a Key ID.'
    );
  }

  // ============================================================
  // PhonePe Payment Gateway
  // ============================================================

  const phonePeClientId = String(
    process.env.PHONEPE_CLIENT_ID || ''
  ).trim();

  const phonePeClientSecret = String(
    process.env.PHONEPE_CLIENT_SECRET || ''
  ).trim();

  const phonePeClientVersion = Number(
    process.env.PHONEPE_CLIENT_VERSION || 1
  );

  const phonePeEnvRaw = String(process.env.PHONEPE_ENV || '')
    .trim()
    .toLowerCase();

  if (isProd && !phonePeEnvRaw) {
    console.warn(
      '[dropshipguru-backend] PHONEPE_ENV is unset while NODE_ENV=production. PhonePe stays inactive until PHONEPE_ENV=production and production credentials are set in the host environment.'
    );
  }

  const phonePeEnv = phonePeEnvRaw || 'sandbox';

  const phonePeMerchantId = String(
    process.env.PHONEPE_MERCHANT_ID || ''
  ).trim();

  const phonePeRedirectUrl = String(
    process.env.PHONEPE_REDIRECT_URL || ''
  ).trim();

  // Webhook Basic-auth pair configured on the PhonePe dashboard.
  // Used only to validate incoming callbacks; never logged.
  const phonePeWebhookUsername = String(
    process.env.PHONEPE_WEBHOOK_USERNAME || ''
  ).trim();

  const phonePeWebhookPassword = String(
    process.env.PHONEPE_WEBHOOK_PASSWORD || ''
  );

  const phonePeExpireAfterSeconds = Number(
    process.env.PHONEPE_EXPIRE_AFTER_SECONDS || 0
  );

  // PhonePe production credentials are required at startup.
  // Sandbox credentials are checked when a payment is requested.

  if (!['sandbox', 'production'].includes(phonePeEnv)) {
    throw new Error(
      'PHONEPE_ENV must be either "sandbox" or "production"'
    );
  }

  if (phonePeEnv === 'production') {
    if (!phonePeClientId || !phonePeClientSecret) {
      throw new Error(
        'PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET are required when PHONEPE_ENV=production'
      );
    }

    if (!phonePeRedirectUrl) {
      throw new Error(
        'PHONEPE_REDIRECT_URL is required when PHONEPE_ENV=production (use https://dropshipguru.in/payment-status.html)'
      );
    }
  }

  if (phonePeRedirectUrl) {
    let parsedRedirect;

    try {
      parsedRedirect = new URL(phonePeRedirectUrl);
    } catch (_err) {
      throw new Error(
        'PHONEPE_REDIRECT_URL must be an absolute URL (e.g. https://dropshipguru.in/payment-status.html)'
      );
    }

    if (!['http:', 'https:'].includes(parsedRedirect.protocol)) {
      throw new Error(
        'PHONEPE_REDIRECT_URL must use http or https'
      );
    }

    // PhonePe will not process a live checkout whose redirect target is
    // localhost — it must be the whitelisted merchant domain.
    if (phonePeEnv === 'production') {
      if (parsedRedirect.protocol !== 'https:') {
        throw new Error(
          'PHONEPE_REDIRECT_URL must use https when PHONEPE_ENV=production'
        );
      }

      if (
        !['dropshipguru.in', 'www.dropshipguru.in'].includes(
          parsedRedirect.hostname
        )
      ) {
        throw new Error(
          'PHONEPE_REDIRECT_URL must be on dropshipguru.in or www.dropshipguru.in when PHONEPE_ENV=production'
        );
      }
    }
  }

  if (
    !Number.isInteger(phonePeClientVersion) ||
    phonePeClientVersion < 1
  ) {
    throw new Error(
      'PHONEPE_CLIENT_VERSION must be a positive integer'
    );
  }

  // ============================================================
  // CORS
  // ============================================================

  const corsOrigins = parseOrigins(
    process.env.CORS_ORIGINS ||
      'https://dropshipguru.in,https://www.dropshipguru.in,http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000'
  );

  // Origins a PhonePe redirect may target: our own frontends plus whatever
  // origin PHONEPE_REDIRECT_URL already points at.
  const phonePeAllowedRedirectOrigins = Array.from(
    new Set(
      corsOrigins
        .concat(phonePeRedirectUrl ? [phonePeRedirectUrl] : [])
        .map((value) => {
          try {
            return new URL(value).origin;
          } catch (_err) {
            return null;
          }
        })
        .filter(Boolean)
    )
  );

  // ============================================================
  // Final Configuration
  // ============================================================

  return {
    nodeEnv,
    isProd,

    port: Number(process.env.PORT) || 5000,

    corsOrigins,

    // ----------------------------------------------------------
    // Razorpay — retained for existing legacy code
    // ----------------------------------------------------------

    razorpay: {
      keyId,
      keySecret,
      webhookSecret: razorpayWebhookSecret,
    },

    // ----------------------------------------------------------
    // PhonePe — primary payment gateway
    // ----------------------------------------------------------

    phonepe: {
      clientId: phonePeClientId,
      clientSecret: phonePeClientSecret,
      clientVersion: phonePeClientVersion,
      environment: phonePeEnv,
      merchantId: phonePeMerchantId,
      redirectUrl: phonePeRedirectUrl,

      // A caller-supplied redirectUrl is only honoured when its origin is
      // one of ours, so this endpoint cannot be used as an open redirect.
      allowedRedirectOrigins: phonePeAllowedRedirectOrigins,

      webhookUsername: phonePeWebhookUsername,
      webhookPassword: phonePeWebhookPassword,

      expireAfterSeconds:
        Number.isInteger(phonePeExpireAfterSeconds) &&
        phonePeExpireAfterSeconds > 0
          ? phonePeExpireAfterSeconds
          : null,
    },

    // ----------------------------------------------------------
    // Google Sheets
    // ----------------------------------------------------------

    googleScriptUrl: String(
      process.env.GOOGLE_SCRIPT_URL || ''
    ).trim(),

    // ----------------------------------------------------------
    // Payment amount limit
    // ----------------------------------------------------------

    maxOrderAmountInr:
      Number(process.env.MAX_ORDER_AMOUNT_INR) || 100000,
  };
}

module.exports = {
  loadEnv,
};