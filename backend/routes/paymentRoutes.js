'use strict';

const express = require('express');
const paymentController = require('../controllers/paymentController');
const { requireFields } = require('../middleware/validate');
const { createPaymentLimiter, createWebhookLimiter } = require('../middleware/security');

function createPaymentRouter(env) {
  const router = express.Router();
  const paymentLimiter = createPaymentLimiter();
  const webhookLimiter = createWebhookLimiter();

  router.post(
    '/create-order',
    paymentLimiter,
    requireFields(['amount']),
    paymentController.createOrder(env)
  );

  router.post(
    '/verify',
    paymentLimiter,
    requireFields(['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature']),
    paymentController.verifyPayment(env)
  );

  router.post(
    '/webhook',
    webhookLimiter,
    paymentController.handleWebhook(env)
  );

  return router;
}

module.exports = { createPaymentRouter };
