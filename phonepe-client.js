/**
 * DropshipGuru — PhonePe Standard Checkout client (frontend)
 *
 * Talks only to the Express backend. No PhonePe credentials, tokens or
 * secrets ever exist in this file.
 *
 * Flow:
 *   click Pay
 *     -> POST /api/payment/phonepe/create-payment   (backend creates the order)
 *     -> top-level redirect to the PhonePe checkout URL
 *     -> PhonePe redirects back to payment-status.html?merchantOrderId=…
 *     -> POST /api/payment/phonepe/confirm/:merchantOrderId  (server-side verify)
 *     -> only a confirmed COMPLETED state counts as paid
 *
 * Razorpay (payment-client.js) is untouched and remains available.
 */
(function (global) {
  'use strict';

  var PROD_API_BASE = 'https://dropshipgurufi-api.onrender.com';
  var LOCAL_API_BASE = 'http://localhost:5000';

  var RETURN_PAGE = '/payment-status.html';
  var STORAGE_KEY = 'dg_phonepe_pending_order';

  var CUSTOMER_FIELDS = [
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
    'source',
  ];

  function isLocalHost() {
    var host = global.location && global.location.hostname;
    return host === 'localhost' || host === '127.0.0.1';
  }

  var API_BASE = isLocalHost() ? LOCAL_API_BASE : PROD_API_BASE;

  function returnUrl() {
    return global.location.origin + RETURN_PAGE;
  }

  function pickCustomerFields(src) {
    var out = {};
    var data = src || {};

    CUSTOMER_FIELDS.forEach(function (key) {
      out[key] = data[key] == null ? '' : String(data[key]);
    });

    if (!out.source) out.source = 'Website';

    return out;
  }

  function apiRequest(method, path, body) {
    var init = {
      method: method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (body) init.body = JSON.stringify(body);

    return fetch(API_BASE + path, init).then(function (res) {
      return res.text().then(function (text) {
        var data = null;

        if (text) {
          try {
            data = JSON.parse(text);
          } catch (_e) {
            data = null;
          }
        }

        if (!res.ok || !data || !data.success) {
          var msg =
            (data && data.error && data.error.message) ||
            (data && data.message) ||
            'Payment request failed (' + res.status + ')';

          var err = new Error(msg);
          err.status = res.status;
          err.response = data;
          throw err;
        }

        return data.data;
      });
    });
  }

  function warmApi() {
    return fetch(API_BASE + '/health', {
      method: 'GET',
      mode: 'cors',
      cache: 'no-store',
      credentials: 'omit',
    }).catch(function () {
      return null;
    });
  }

  function newIdempotencyKey() {
    if (global.crypto && typeof global.crypto.randomUUID === 'function') {
      return global.crypto.randomUUID();
    }

    return 'dg-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  }

  function rememberPendingOrder(record) {
    try {
      global.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch (_e) {
      /* private mode — the merchantOrderId also travels in the return URL */
    }
  }

  function readPendingOrder() {
    try {
      var raw = global.sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_e) {
      return null;
    }
  }

  function clearPendingOrder() {
    try {
      global.sessionStorage.removeItem(STORAGE_KEY);
    } catch (_e) {
      /* nothing to clean up */
    }
  }

  /**
   * Create the order and hand the browser to PhonePe.
   * Resolves only if the redirect could not be performed.
   */
  function startCheckout(opts) {
    opts = opts || {};

    var amount = Number(opts.amount);

    if (!Number.isFinite(amount) || amount < 1) {
      return Promise.reject(new Error('Minimum payable amount is ₹1'));
    }

    var customerFields = pickCustomerFields(opts.formData || opts);

    if (!customerFields.price && amount) {
      customerFields.price = '₹' + Number(amount).toLocaleString('en-IN');
    }

    var body = Object.assign({}, customerFields, {
      amount: amount,
      redirectUrl: opts.redirectUrl || returnUrl(),
      idempotencyKey: opts.idempotencyKey || newIdempotencyKey(),
    });

    return apiRequest('POST', '/api/payment/phonepe/create-payment', body).then(
      function (order) {
        rememberPendingOrder({
          merchantOrderId: order.merchantOrderId,
          amount: order.amount,
          customer: customerFields,
          createdAt: Date.now(),
        });

        // Top-level navigation in the same tab. PhonePe's checkout page will
        // not render correctly when opened in a popup or a new tab.
        global.location.assign(order.redirectUrl);

        return order;
      }
    );
  }

  /**
   * Ask the backend to verify the order with PhonePe. The browser returning
   * from PhonePe proves nothing on its own — this is the only source of truth.
   */
  function confirmPayment(merchantOrderId) {
    var id =
      merchantOrderId ||
      new URLSearchParams(global.location.search).get('merchantOrderId') ||
      (readPendingOrder() || {}).merchantOrderId;

    if (!id) {
      return Promise.reject(new Error('No PhonePe order to confirm'));
    }

    return apiRequest(
      'POST',
      '/api/payment/phonepe/confirm/' + encodeURIComponent(id)
    );
  }

  function getStatus(merchantOrderId) {
    return apiRequest(
      'GET',
      '/api/payment/phonepe/status/' + encodeURIComponent(merchantOrderId)
    );
  }

  function resolvePayableAmount(formData) {
    if (!formData) return 0;

    var digits = String(formData.price || '').replace(/[^\d.]/g, '');
    var n = Number(digits);

    return Number.isFinite(n) ? n : 0;
  }

  global.DropshipGuruPhonePe = {
    apiBase: API_BASE,
    CUSTOMER_FIELDS: CUSTOMER_FIELDS,
    startCheckout: startCheckout,
    confirmPayment: confirmPayment,
    getStatus: getStatus,
    resolvePayableAmount: resolvePayableAmount,
    readPendingOrder: readPendingOrder,
    clearPendingOrder: clearPendingOrder,
    warmup: warmApi,
  };
})(typeof window !== 'undefined' ? window : globalThis);
