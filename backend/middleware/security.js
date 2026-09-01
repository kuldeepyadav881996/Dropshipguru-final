'use strict';

const rateLimit = require('express-rate-limit');

function createPaymentLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many payment requests. Please try again later.',
      },
    },
  });
}

function createWebhookLimiter() {
  return rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many webhook requests.',
      },
    },
  });
}

module.exports = { createPaymentLimiter, createWebhookLimiter };
