/**
 * DropshipGuru — Razorpay Checkout client (frontend)
 * Talks only to the Express backend. Never uses the Razorpay secret.
 */
(function (global) {
  'use strict';

  // ===== Production Backend =====
  var DEFAULT_API_BASE = 'https://dropshipgurufi-api.onrender.com';

  function loadRazorpayCheckout() {
    if (global.Razorpay) return Promise.resolve();

    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.async = true;
      s.onload = resolve;
      s.onerror = function () {
        reject(new Error('Failed to load Razorpay Checkout'));
      };
      document.head.appendChild(s);
    });
  }

  async function apiPost(path, body) {
    const response = await fetch(DEFAULT_API_BASE + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body || {})
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(
        json?.error?.message ||
        json?.message ||
        'Payment request failed'
      );
    }

    return json.data;
  }

  async function startCheckout(opts) {
    opts = opts || {};

    const amount = Number(opts.amount);

    if (!amount || amount <= 0) {
      throw new Error('Invalid payment amount');
    }

    await loadRazorpayCheckout();

    const order = await apiPost('/api/payment/create-order', {
      amount: amount,
      currency: 'INR',
      customer: opts.customer || {},
      notes: opts.notes || {}
    });

    return new Promise(function (resolve, reject) {

      const rzp = new Razorpay({

        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,

        name: 'Dropship Guru',
        description: opts.description || 'DropshipGuru Payment',

        prefill: {
          name: opts.customer?.name || '',
          email: opts.customer?.email || '',
          contact: opts.customer?.contact || ''
        },

        theme: {
          color: '#D4AF37'
        },

        handler: async function (response) {

          try {

            await apiPost('/api/payment/verify', {

              razorpay_order_id: response.razorpay_order_id,

              razorpay_payment_id: response.razorpay_payment_id,

              razorpay_signature: response.razorpay_signature

            });

            resolve(response);

          } catch (e) {

            reject(e);

          }

        },

        modal: {

          ondismiss: function () {

            reject(new Error('Payment cancelled'));

          }

        }

      });

      rzp.on('payment.failed', function (e) {

        reject(
          new Error(
            e?.error?.description ||
            e?.error?.reason ||
            'Payment Failed'
          )
        );

      });

      rzp.open();

    });

  }

  function resolvePayableAmount(formData) {

    if (!formData) return 0;

    const price = Number(
      String(formData.price || '').replace(/[^\d.]/g, '')
    );

    return isNaN(price) ? 0 : price;

  }

  global.DropshipGuruPayments = {

    apiBase: DEFAULT_API_BASE,

    startCheckout,

    resolvePayableAmount

  };

})(window);
