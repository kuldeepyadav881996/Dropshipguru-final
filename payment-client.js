/**
 * DropshipGuru — Razorpay Checkout client (frontend)
 * Talks only to the Express backend. Never uses the Razorpay secret.
 */
(function (global) {
  'use strict';

  var DEFAULT_API_BASE =
    (global.DROPSHIPGURU_API_BASE && String(global.DROPSHIPGURU_API_BASE).replace(/\/$/, '')) ||
    'http://localhost:5000';

  function loadRazorpayCheckout() {
    if (global.Razorpay) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Failed to load Razorpay Checkout')); };
      document.head.appendChild(s);
    });
  }

  function apiPost(path, body) {
    return fetch(DEFAULT_API_BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok || !data.success) {
          var msg =
            (data && data.error && data.error.message) ||
            'Payment request failed';
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
   * Create order → open Razorpay Checkout → verify signature on backend.
   * @param {Object} opts
   * @param {number|string} opts.amount - INR amount (e.g. 299)
   * @param {Object} [opts.customer] - { name, email, contact }
   * @param {Object} [opts.notes]
   * @param {string} [opts.description]
   * @returns {Promise<{orderId, paymentId, signature}>}
   */
  function startCheckout(opts) {
    opts = opts || {};
    var amount = Number(opts.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return Promise.reject(new Error('Invalid payment amount'));
    }

    return loadRazorpayCheckout()
      .then(function () {
        return apiPost('/api/payment/create-order', {
          amount: amount,
          currency: 'INR',
          notes: opts.notes || {},
          customer: opts.customer || {},
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
              name: (opts.customer && opts.customer.name) || '',
              email: (opts.customer && opts.customer.email) || '',
              contact: (opts.customer && opts.customer.contact) || '',
            },
            theme: { color: '#D4AF37' },
            handler: function (response) {
              apiPost('/api/payment/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
                .then(function () {
                  resolve({
                    orderId: response.razorpay_order_id,
                    paymentId: response.razorpay_payment_id,
                    signature: response.razorpay_signature,
                  });
                })
                .catch(reject);
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
    apiBase: DEFAULT_API_BASE,
    startCheckout: startCheckout,
    resolvePayableAmount: resolvePayableAmount,
  };
})(typeof window !== 'undefined' ? window : globalThis);
