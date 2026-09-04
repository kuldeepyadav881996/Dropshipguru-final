'use strict';

const razorpayService = require('../services/razorpayService');
const phonepeService = require('../services/phonepeService');
const googleSheetsService = require('../services/googleSheetsService');
const orderStore = require('../services/orderStore');
const { describeError } = require('../utils/sanitize');

// ============================================================
// RAZORPAY
// ============================================================

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
          customer_name:
            customer && customer.name
              ? String(customer.name).slice(0, 100)
              : undefined,
          customer_email:
            customer && customer.email
              ? String(customer.email).slice(0, 100)
              : undefined,
          customer_contact:
            customer && customer.contact
              ? String(customer.contact).slice(0, 20)
              : undefined,
        },
      });

      // Return Key ID only.
      // NEVER return RAZORPAY_KEY_SECRET / keySecret.
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
      const body = req.body || {};

      // 1) Razorpay signature verification
      const result = razorpayService.verifyPaymentSignature(env, body);

      // 2) Save complete customer data to Google Sheets
      let sheet = { ok: false, skipped: true };

      try {
        sheet = await googleSheetsService.submitLeadToGoogleSheet(
          env,
          body,
          {
            orderId: result.orderId,
            paymentId: result.paymentId,
          }
        );
      } catch (sheetErr) {
        console.error(
          '[verify] Google Sheets unexpected error (payment still verified)',
          sheetErr && sheetErr.message
            ? sheetErr.message
            : sheetErr
        );

        sheet = {
          ok: false,
          error: 'SHEETS_UNEXPECTED_ERROR',
        };
      }

      res.status(200).json({
        success: true,
        data: {
          verified: true,
          orderId: result.orderId,
          paymentId: result.paymentId,
          sheetSaved: Boolean(sheet && sheet.ok),
        },
      });
    } catch (err) {
      next(err);
    }
  };
}

function handleWebhook(env) {
  return async (req, res, next) => {
    try {
      const signature =
        req.headers['x-razorpay-signature'];

      const rawBody = req.rawBody;

      if (!rawBody) {
        const err = new Error(
          'Raw body unavailable for webhook verification'
        );

        err.statusCode = 500;
        err.code = 'RAW_BODY_MISSING';

        throw err;
      }

      razorpayService.verifyWebhookSignature(
        env,
        rawBody,
        signature
      );

      const event = req.body || {};
      const eventName = event.event || 'unknown';

      console.info('[razorpay-webhook]', {
        event: eventName,
        entity:
          event.payload &&
          event.payload.payment &&
          event.payload.payment.entity &&
          event.payload.payment.entity.id,
      });

      res.status(200).json({
        success: true,
        received: true,
      });
    } catch (err) {
      next(err);
    }
  };
}

// ============================================================
// PHONEPE
// ============================================================

/**
 * Confirm an order against PhonePe.
 * The browser returning to the site is never treated as payment success.
 * Google Sheet / order recording is intentionally not connected here yet.
 */
async function confirmPhonePeOrder(env, merchantOrderId, trigger) {
  const status = await phonepeService.getPaymentStatus(env, merchantOrderId);
  const paid = phonepeService.isPaidState(status.state);

  const record = orderStore.get(merchantOrderId);

  if (record) {
    orderStore.update(merchantOrderId, { state: status.state });
  }

  console.info('[phonepe] confirm', {
    merchantOrderId,
    trigger,
    state: status.state,
    paid,
  });

  return { status, paid };
}

function createPhonePePayment(env) {
  return async (req, res, next) => {
    try {
      const body = req.body || {};

      // A double-clicked Pay button must not create two PhonePe orders.
      const idempotencyKey = body.idempotencyKey
        ? String(body.idempotencyKey).slice(0, 100)
        : null;

      const existing = orderStore.findReusableByIdempotencyKey(idempotencyKey);

      if (existing) {
        console.info('[phonepe] reusing existing checkout session', {
          merchantOrderId: existing.merchantOrderId,
        });

        return res.status(200).json({
          success: true,
          data: {
            merchantOrderId: existing.merchantOrderId,
            amount: existing.amountPaise,
            redirectUrl: existing.checkoutUrl,
            reused: true,
          },
        });
      }

      const payment = await phonepeService.createPayment(env, {
        amount: body.amount,
        redirectUrl: body.redirectUrl,
      });

      orderStore.create(payment.merchantOrderId, {
        amountPaise: payment.amount,
        idempotencyKey,
        checkoutUrl: payment.redirectUrl,
      });

      return res.status(201).json({
        success: true,
        data: {
          merchantOrderId: payment.merchantOrderId,
          amount: payment.amount,
          expireAt: payment.expireAt,
          redirectUrl: payment.redirectUrl,
        },
      });
    } catch (err) {
      return next(err);
    }
  };
}

function getPhonePePaymentStatus(env) {
  return async (req, res, next) => {
    try {
      const merchantOrderId = req.params.merchantOrderId;

      const status = await phonepeService.getPaymentStatus(
        env,
        merchantOrderId
      );

      res.status(200).json({
        success: true,
        data: {
          merchantOrderId: status.merchantOrderId,
          state: status.state,
          paid: phonepeService.isPaidState(status.state),
          amount: status.amount,
          errorCode: status.errorCode,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Called by the return page after PhonePe redirects the customer back.
 * The browser is never trusted — the state comes from the Order Status API.
 */
function confirmPhonePePayment(env) {
  return async (req, res, next) => {
    try {
      const merchantOrderId = req.params.merchantOrderId;

      const result = await confirmPhonePeOrder(env, merchantOrderId, 'redirect');

      res.status(200).json({
        success: true,
        data: {
          merchantOrderId: result.status.merchantOrderId,
          state: result.status.state,
          paid: result.paid,
          pending: !phonepeService.isTerminalState(result.status.state),
          amount: result.status.amount,
          errorCode: result.status.errorCode,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}

function handlePhonePeWebhook(env) {
  return async (req, res, next) => {
    try {
      const rawBody = req.rawBody ? req.rawBody.toString('utf8') : '';

      if (!rawBody) {
        const err = new Error(
          'Raw body unavailable for PhonePe webhook validation'
        );

        err.statusCode = 500;
        err.code = 'RAW_BODY_MISSING';

        throw err;
      }

      const callback = phonepeService.validateWebhook(
        env,
        req.headers.authorization,
        rawBody
      );

      const merchantOrderId =
        callback &&
        callback.payload &&
        callback.payload.merchantOrderId;

      console.info('[phonepe-webhook] received', {
        event: callback && callback.event,
        merchantOrderId,
      });

      // Acknowledge immediately; PhonePe retries on non-2xx.
      res.status(200).json({ success: true, received: true });

      if (merchantOrderId) {
        confirmPhonePeOrder(env, merchantOrderId, 'webhook').catch((err) => {
          console.error('[phonepe-webhook] status check failed', {
            merchantOrderId,
            ...describeError(err),
          });
        });
      }
    } catch (err) {
      next(err);
    }
  };
}

// ============================================================
// HEALTH
// ============================================================

function health(_req, res) {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'dropshipguru-backend',
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  // Razorpay
  createOrder,
  verifyPayment,
  handleWebhook,

  // PhonePe
  createPhonePePayment,
  getPhonePePaymentStatus,
  confirmPhonePePayment,
  handlePhonePeWebhook,

  // Common
  health,
};