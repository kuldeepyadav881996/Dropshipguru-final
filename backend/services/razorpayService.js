'use strict';

const crypto = require('crypto');
const { getRazorpayClient } = require('../config/razorpay');
const { AppError } = require('../middleware/errorHandler');
const { parseAmountToPaise } = require('../middleware/validate');

function sanitizeNotes(notes) {
  if (!notes || typeof notes !== 'object') return {};
  const out = {};
  Object.keys(notes).slice(0, 15).forEach((key) => {
    const safeKey = String(key).slice(0, 40);
    out[safeKey] = String(notes[key]).slice(0, 200);
  });
  return out;
}

async function createOrder(env, payload) {
  const amountPaise = parseAmountToPaise(payload.amount);
  const maxPaise = Math.round(env.maxOrderAmountInr * 100);

  if (amountPaise > maxPaise) {
    throw new AppError(
      `Amount exceeds maximum allowed (₹${env.maxOrderAmountInr})`,
      400,
      'AMOUNT_TOO_LARGE'
    );
  }

  const currency = (payload.currency || 'INR').toUpperCase();
  if (currency !== 'INR') {
    throw new AppError('Only INR currency is supported', 400, 'UNSUPPORTED_CURRENCY');
  }

  const receipt = String(
    payload.receipt || `dg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  ).slice(0, 40);

  const razorpay = getRazorpayClient(env);

  try {
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency,
      receipt,
      notes: sanitizeNotes(payload.notes),
      payment_capture: 1,
    });

    // Public fields only — Key Secret must never leave the server
    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      keyId: env.razorpay.keyId,
    };
  } catch (err) {
    const message =
      (err && err.error && err.error.description) ||
      err.message ||
      'Failed to create Razorpay order';
    throw new AppError(message, 502, 'RAZORPAY_ORDER_FAILED');
  }
}

function verifyPaymentSignature(env, { razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError(
      'razorpay_order_id, razorpay_payment_id and razorpay_signature are required',
      400,
      'VALIDATION_ERROR'
    );
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto
    .createHmac('sha256', env.razorpay.keySecret)
    .update(body)
    .digest('hex');

  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(String(razorpay_signature), 'utf8');

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new AppError('Invalid payment signature', 401, 'INVALID_SIGNATURE');
  }

  return {
    verified: true,
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
  };
}

function verifyWebhookSignature(env, rawBody, signatureHeader) {
  if (!env.razorpay.webhookSecret) {
    throw new AppError('Webhook secret is not configured', 500, 'WEBHOOK_NOT_CONFIGURED');
  }
  if (!signatureHeader) {
    throw new AppError('Missing x-razorpay-signature header', 400, 'MISSING_WEBHOOK_SIGNATURE');
  }

  const expected = crypto
    .createHmac('sha256', env.razorpay.webhookSecret)
    .update(rawBody)
    .digest('hex');

  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(String(signatureHeader), 'utf8');

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new AppError('Invalid webhook signature', 400, 'INVALID_WEBHOOK_SIGNATURE');
  }

  return true;
}

module.exports = {
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
};
