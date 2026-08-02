/**
 * DropshipGuru — Razorpay Checkout client (frontend)
 * Talks only to the Express backend. Never uses the Razorpay secret.
 *
 * Production API is always Render (no localhost in shipped frontend).
 * Flow: create-order → Checkout → verify (full customer payload) → Google Sheet (server-side)
 */
(function (global) {
  'use strict';

  var API_BASE = 'https://dropshipgurufi-api.onrender.com';

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

  function pickCustomerFields(src) {
    var out = {};
    var data = src || {};
    CUSTOMER_FIELDS.forEach(function (key) {
      out[key] = data[key] == null ? '' : String(data[key]);
    });
    if (!out.source) out.source = 'Website';
    return out;
  }

  function loadRazorpayCheckout() {
    if (global.Razorpay) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.async = true;
      s.onload = function () {
        resolve();
      };
      s.onerror = function () {
        reject(new Error('Failed to load Razorpay Checkout'));
      };
      document.head.appendChild(s);
    });
  }

  function apiPost(path, body) {
    return fetch(API_BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    }).then(function (res) {
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
            (res.status ? 'Payment request failed (' + res.status + ')' : 'Payment request failed');
          var err = new Error(msg);
          err.response = data;
          err.status = res.status;
          throw err;
        }
        return data.data;
      });
    });
  }

  /**
   * Create order → open Razorpay Checkout → verify signature + full customer data.
   * Backend saves the complete lead to Google Sheets after successful verification.
   */
  function startCheckout(opts) {
    opts = opts || {};
    var amount = Number(opts.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return Promise.reject(new Error('Invalid payment amount'));
    }

    var customerFields = pickCustomerFields(opts.formData || opts);
    if (!customerFields.price && amount) {
      customerFields.price = '₹' + Number(amount).toLocaleString('en-IN');
    }

    return loadRazorpayCheckout()
      .then(function () {
        return apiPost('/api/payment/create-order', {
          amount: amount,
          currency: 'INR',
          notes: opts.notes || {},
          customer: opts.customer || {
            name: customerFields.fullName,
            email: customerFields.email,
            contact: customerFields.mobile,
          },
        });
      })
      .then(function (order) {
        return new Promise(function (resolve, reject) {
          var rzp = new global.Razorpay({
            key: order.keyId,
            amount: order.amount,
            currency: order.currency,
            name: opts.name || 'Dropship Guru',
            description: opts.description || 'DropshipGuru payment',
            order_id: order.orderId,
            prefill: {
              name: (opts.customer && opts.customer.name) || customerFields.fullName || '',
              email: (opts.customer && opts.customer.email) || customerFields.email || '',
              contact: (opts.customer && opts.customer.contact) || customerFields.mobile || '',
            },
            theme: { color: '#D4AF37' },
            handler: function (response) {
              var verifyBody = Object.assign({}, customerFields, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                timestamp: new Date().toISOString(),
                status: 'PAID',
              });

              if (global.DropshipGuruUI && typeof global.DropshipGuruUI.showProcessing === 'function') {
                global.DropshipGuruUI.showProcessing();
              }

              apiPost('/api/payment/verify', verifyBody)
                .then(function (verified) {
                  resolve({
                    orderId: response.razorpay_order_id,
                    paymentId: response.razorpay_payment_id,
                    signature: response.razorpay_signature,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    sheetSaved: Boolean(verified && verified.sheetSaved),
                  });
                })
                .catch(function (err) {
                  if (
                    global.DropshipGuruUI &&
                    typeof global.DropshipGuruUI.hideProcessing === 'function'
                  ) {
                    global.DropshipGuruUI.hideProcessing();
                  }
                  reject(err);
                });
            },
            modal: {
              ondismiss: function () {
                reject(new Error('Payment cancelled'));
              },
            },
          });

          rzp.on('payment.failed', function (resp) {
            var desc =
              (resp && resp.error && (resp.error.description || resp.error.reason)) ||
              'Payment failed';
            reject(new Error(desc));
          });

          rzp.open();
        });
      });
  }

  function resolvePayableAmount(formData) {
    if (!formData) return 0;
    var raw = formData.price || '';
    var digits = String(raw).replace(/[^\d.]/g, '');
    var n = Number(digits);
    return Number.isFinite(n) ? n : 0;
  }

  global.DropshipGuruPayments = {
    apiBase: API_BASE,
    startCheckout: startCheckout,
    resolvePayableAmount: resolvePayableAmount,
    CUSTOMER_FIELDS: CUSTOMER_FIELDS,
  };
})(typeof window !== 'undefined' ? window : globalThis);
