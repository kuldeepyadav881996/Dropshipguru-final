'use strict';

const CUSTOMER_FIELDS = [
  'fullName',
  'mobile',
  'email',
  'state',
  'profession',
  'selectedType',
  'selectedPlan',
  'selectedCourse',
  'selectedService',
  'selectedPlatform',
  'budget',
  'price',
  'message',
];

/**
 * Build Apps Script form payload (same field names as google-sheet-submit.js).
 * Uses URLSearchParams so e.parameter works on the script side.
 * Includes complete paid-lead fields: customer + plan/platform/service + budget/price + payment IDs + timestamp.
 */
function buildSheetPayload(body, paymentMeta) {
  const src = body || {};
  const params = new URLSearchParams();

  CUSTOMER_FIELDS.forEach((key) => {
    const value = src[key] == null ? '' : String(src[key]);
    params.append(key, value);
  });

  params.append('source', src.source ? String(src.source) : 'Website');

  // Payment metadata (also appended into message for sheet visibility)
  const orderId =
    (paymentMeta && paymentMeta.orderId) ||
    src.orderId ||
    src.razorpay_order_id ||
    '';
  const paymentId =
    (paymentMeta && paymentMeta.paymentId) ||
    src.paymentId ||
    src.razorpay_payment_id ||
    '';
  const timestamp =
    src.timestamp && String(src.timestamp).trim()
      ? String(src.timestamp)
      : new Date().toISOString();
  const status = paymentId || orderId ? 'PAID' : String(src.status || 'LEAD');

  if (orderId) {
    params.append('razorpay_order_id', String(orderId));
    params.append('orderId', String(orderId));
  }
  if (paymentId) {
    params.append('razorpay_payment_id', String(paymentId));
    params.append('paymentId', String(paymentId));
  }
  params.append('status', status);
  params.append('paymentStatus', status);
  params.append('timestamp', timestamp);

  let message = src.message == null ? '' : String(src.message);
  if (paymentId || orderId) {
    const paymentLine =
      'Status: PAID | Razorpay Payment ID: ' +
      (paymentId || '-') +
      ' | Order ID: ' +
      (orderId || '-') +
      ' | Timestamp: ' +
      timestamp;
    message = message ? message + '\n' + paymentLine : paymentLine;
    params.set('message', message);
  }

  return params;
}

/**
 * POST customer + payment data to Google Apps Script.
 * Never throws to the caller for network/script failures — logs and returns { ok:false }.
 */
async function submitLeadToGoogleSheet(env, body, paymentMeta) {
  const url = env.googleScriptUrl;
  if (!url) {
    console.warn('[google-sheets] GOOGLE_SCRIPT_URL is not set; skipping sheet write');
    return { ok: false, skipped: true, reason: 'GOOGLE_SCRIPT_URL_MISSING' };
  }

  const params = buildSheetPayload(body, paymentMeta);

  try {
    // Apps Script often responds with 302; treat redirect as accepted write.
    const response = await fetch(url, {
      method: 'POST',
      body: params,
      redirect: 'manual',
    });

    const status = response.status;
    const redirected = status >= 300 && status < 400;
    let text = '';
    try {
      text = await response.text();
    } catch (_e) {
      text = '';
    }

    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch (_e) {
      json = null;
    }

    if (!response.ok && !redirected) {
      console.error('[google-sheets] Apps Script HTTP error', {
        status,
        body: text && text.slice(0, 300),
      });
      return { ok: false, status, body: json, text };
    }

    if (json && (json.success === false || json.status === 'error')) {
      console.error('[google-sheets] Apps Script reported failure', json);
      return { ok: false, status, body: json, text };
    }

    console.info('[google-sheets] Lead saved', {
      paymentId: paymentMeta && paymentMeta.paymentId,
      orderId: paymentMeta && paymentMeta.orderId,
      status,
    });
    return { ok: true, status, body: json, text };
  } catch (err) {
    console.error('[google-sheets] Submit failed', err && err.message ? err.message : err);
    return { ok: false, error: err && err.message ? err.message : 'SHEETS_SUBMIT_FAILED' };
  }
}

module.exports = {
  CUSTOMER_FIELDS,
  buildSheetPayload,
  submitLeadToGoogleSheet,
};
