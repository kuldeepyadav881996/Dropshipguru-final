'use strict';

const requiredAlways = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
const requiredInProduction = ['RAZORPAY_WEBHOOK_SECRET'];

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

  const missingAlways = requiredAlways.filter((key) => !process.env[key]);
  if (missingAlways.length) {
    throw new Error(
      `Missing required Razorpay environment variables: ${missingAlways.join(', ')}. ` +
        'Copy backend/.env.example to backend/.env and set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET.'
    );
  }

  if (isProd) {
    const missingProd = requiredInProduction.filter((key) => !process.env[key]);
    if (missingProd.length) {
      throw new Error(
        `Missing required production environment variables: ${missingProd.join(', ')}`
      );
    }
  }

  // Defense-in-depth: never allow secret-looking values to be treated as Key ID
  const keyId = String(process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = String(process.env.RAZORPAY_KEY_SECRET || '').trim();

  if (!keyId.startsWith('rzp_')) {
    throw new Error('RAZORPAY_KEY_ID looks invalid (expected value starting with rzp_)');
  }
  if (keySecret.startsWith('rzp_')) {
    throw new Error(
      'RAZORPAY_KEY_SECRET appears to be a Key ID. Put the Secret Key in RAZORPAY_KEY_SECRET only.'
    );
  }

  const corsOrigins = parseOrigins(
    process.env.CORS_ORIGINS ||
      'http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000'
  );

  return {
    nodeEnv,
    isProd,
    port: Number(process.env.PORT) || 5000,
    corsOrigins,
    razorpay: {
      keyId,
      keySecret,
      webhookSecret: String(process.env.RAZORPAY_WEBHOOK_SECRET || '').trim(),
    },
    maxOrderAmountInr: Number(process.env.MAX_ORDER_AMOUNT_INR) || 100000,
  };
}

module.exports = { loadEnv };
