'use strict';

const express = require('express');

const paymentController = require('../controllers/paymentController');

const { requireFields } = require('../middleware/validate');

const {
  createPaymentLimiter,
  createWebhookLimiter,
} = require('../middleware/security');

function createPaymentRouter(env) {
  const router = express.Router();

  const paymentLimiter = createPaymentLimiter();
  const webhookLimiter = createWebhookLimiter();

  // ============================================================
  // RAZORPAY ROUTES — EXISTING
  // ============================================================

  router.post(
    '/create-order',
    paymentLimiter,
    requireFields(['amount']),
    paymentController.createOrder(env)
  );

  router.post(
    '/verify',
    paymentLimiter,
    requireFields([
      'razorpay_order_id',
      'razorpay_payment_id',
      'razorpay_signature',
    ]),
    paymentController.verifyPayment(env)
  );

  router.post(
    '/webhook',
    webhookLimiter,
    paymentController.handleWebhook(env)
  );

  // ============================================================
  // PHONEPE ROUTES
  // ============================================================

  // Create PhonePe checkout
  router.post(
    '/phonepe/create-payment',
    paymentLimiter,
    requireFields(['amount']),
    paymentController.createPhonePePayment(env)
  );

  // Check PhonePe payment status (read-only)
  router.get(
    '/phonepe/status/:merchantOrderId',
    paymentLimiter,
    paymentController.getPhonePePaymentStatus(env)
  );

  // Confirm payment server-side after the customer returns from PhonePe.
  router.post(
    '/phonepe/confirm/:merchantOrderId',
    paymentLimiter,
    paymentController.confirmPhonePePayment(env)
  );

  // PhonePe server-to-server callback
  router.post(
    '/phonepe/webhook',
    webhookLimiter,
    paymentController.handlePhonePeWebhook(env)
  );

  return router;
}

module.exports = { createPaymentRouter };