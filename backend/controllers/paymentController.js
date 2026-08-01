'use strict';

const razorpayService = require('../services/razorpayService');

function createOrder(env) {
  return async (req, res, next) => {
    try {
      const { amount, currency, receipt, notes, customer } = req.body || {};

      const order = await razorpayService.createOrder(env, {
        amount,
        currency,
        receipt,
        notes: {
          ...notes,
          customer_name: customer && customer.name ? String(customer.name).slice(0, 100) : undefined,
          customer_email:
            customer && customer.email ? String(customer.email).slice(0, 100) : undefined,
          customer_contact:
            customer && customer.contact ? String(customer.contact).slice(0, 20) : undefined,
        },
      });

      // Return Key ID only. Never return RAZORPAY_KEY_SECRET / keySecret.
      res.status(201).json({
        success: true,
        data: {
          orderId: order.orderId,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          keyId: order.keyId,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}

function verifyPayment(env) {
  return async (req, res, next) => {
    try {
      const result = razorpayService.verifyPaymentSignature(env, req.body || {});
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
}

function handleWebhook(env) {
  return async (req, res, next) => {
    try {
      const signature = req.headers['x-razorpay-signature'];
      const rawBody = req.rawBody;

      if (!rawBody) {
        const err = new Error('Raw body unavailable for webhook verification');
        err.statusCode = 500;
        err.code = 'RAW_BODY_MISSING';
        throw err;
      }

      razorpayService.verifyWebhookSignature(env, rawBody, signature);

      const event = req.body || {};
      const eventName = event.event || 'unknown';

      // Acknowledge quickly. Extend with fulfillment / Sheets / email as needed.
      console.info('[razorpay-webhook]', {
        event: eventName,
        entity:
          event.payload &&
          event.payload.payment &&
          event.payload.payment.entity &&
          event.payload.payment.entity.id,
      });

      res.status(200).json({ success: true, received: true });
    } catch (err) {
      next(err);
    }
  };
}

function health(_req, res) {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'dropshipguru-backend',
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
  health,
};
