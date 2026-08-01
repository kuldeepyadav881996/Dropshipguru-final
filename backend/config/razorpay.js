'use strict';

const Razorpay = require('razorpay');

let client = null;

function getRazorpayClient(env) {
  if (client) return client;

  if (!env.razorpay.keyId || !env.razorpay.keySecret) {
    throw new Error('Razorpay keys are not configured');
  }

  // Secret is read only from env via config/env.js — never from request/frontend
  client = new Razorpay({
    key_id: env.razorpay.keyId,
    key_secret: env.razorpay.keySecret,
  });

  return client;
}

module.exports = { getRazorpayClient };
