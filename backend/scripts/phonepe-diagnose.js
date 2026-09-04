'use strict';

/**
 * PhonePe integration diagnostic (safe logging).
 *
 * Prints ONLY non-sensitive configuration facts and sanitized API results.
 * Never prints clientSecret, access tokens, checkout tokens or Authorization headers.
 *
 * Usage (from ./backend):  node scripts/phonepe-diagnose.js [amountInInr]
 */

const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { loadEnv } = require('../config/env');
const phonepeService = require('../services/phonepeService');
const { sanitizeUrl } = require('../utils/sanitize');

function present(value) {
  return value ? 'SET' : 'MISSING';
}

async function main() {
  const env = loadEnv();

  console.log('--- PhonePe configuration (sanitized) ---');
  console.log('nodeEnv              :', env.nodeEnv);
  console.log('PHONEPE_ENV          :', env.phonepe.environment);
  console.log('PHONEPE_CLIENT_ID    :', present(env.phonepe.clientId));
  console.log('PHONEPE_CLIENT_SECRET:', present(env.phonepe.clientSecret));
  console.log('PHONEPE_CLIENT_VERSION:', env.phonepe.clientVersion);
  console.log('PHONEPE_MERCHANT_ID  :', present(env.phonepe.merchantId));
  console.log('PHONEPE_REDIRECT_URL :', sanitizeUrl(env.phonepe.redirectUrl));
  console.log('maxOrderAmountInr    :', env.maxOrderAmountInr);

  const amount = Number(process.argv[2] || 1);

  console.log('');
  console.log('--- create-payment ---');

  let created = null;

  try {
    created = await phonepeService.createPayment(env, { amount });
    console.log('merchantOrderId :', created.merchantOrderId);
    console.log('amount (paise)  :', created.amount);
    console.log('checkout url    :', sanitizeUrl(created.redirectUrl));
    console.log('expireAt        :', created.expireAt || '(not returned)');
    console.log('state           :', created.state || '(not returned)');
  } catch (err) {
    console.error('create-payment FAILED:', err && err.message);
    console.error('code:', err && err.code);
    console.error('details:', err && err.details);
    process.exitCode = 1;
    return;
  }

  console.log('');
  console.log('--- order status (immediately after creation) ---');

  try {
    const status = await phonepeService.getPaymentStatus(
      env,
      created.merchantOrderId
    );

    console.log('merchantOrderId :', status.merchantOrderId);
    console.log('state           :', status.state);
    console.log('orderId         :', status.orderId || '(none)');
    console.log('amount (paise)  :', status.amount);
    console.log('attempts        :', status.paymentDetails.length);
  } catch (err) {
    console.error('status FAILED:', err && err.message);
    console.error('code:', err && err.code);
    console.error('details:', err && err.details);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('diagnostic crashed:', err && err.message);
  process.exitCode = 1;
});
