/**
 * DropshipGuru — Premium UI interactions (frontend only)
 * Does not alter payment/API/business logic.
 */
(function (global) {
  'use strict';

  var doc = global.document;
  if (!doc) return;

  function qs(sel, root) {
    return (root || doc).querySelector(sel);
  }
  function qsa(sel, root) {
    return Array.prototype.slice.call((root || doc).querySelectorAll(sel));
  }

  /* ----- Ripple ----- */
  function addRipple(e) {
    var el = e.currentTarget;
    if (!el || el.disabled || el.classList.contains('is-loading')) return;
    var rect = el.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    var ripple = doc.createElement('span');
    ripple.className = 'dg-ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
    ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
    el.appendChild(ripple);
    setTimeout(function () {
      if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
    }, 650);
  }

  function bindRipples() {
    var selectors =
      '.btn, .submit-btn, .step-next-btn, .nav-cta, .ab-cta, .plan-cta, .course-cta, .cta-primary, .cta-secondary';
    qsa(selectors).forEach(function (el) {
      if (el.dataset.dgRippleBound) return;
      el.dataset.dgRippleBound = '1';
      if (global.getComputedStyle(el).position === 'static') {
        el.style.position = 'relative';
      }
      el.addEventListener('click', addRipple);
    });
  }

  function rafThrottle(fn) {
    var ticking = false;
    return function () {
      if (ticking) return;
      ticking = true;
      global.requestAnimationFrame(function () {
        ticking = false;
        fn();
      });
    };
  }

  /* ----- Sticky header scrolled state ----- */
  function bindHeaderScroll() {
    var header = qs('.site-header');
    if (!header) return;
    var onScroll = rafThrottle(function () {
      var scrolled = global.scrollY > 16;
      header.classList.toggle('pm-scrolled', scrolled);
      header.classList.toggle('is-scrolled', scrolled);
    });
    onScroll();
    global.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ----- Active nav indicator ----- */
  function bindActiveNav() {
    var links = qsa('#navMenu a[href^="#"]');
    if (!links.length) return;
    var sections = links
      .map(function (a) {
        var id = a.getAttribute('href').slice(1);
        return { a: a, el: doc.getElementById(id) };
      })
      .filter(function (x) {
        return x.el;
      });

    var setActive = rafThrottle(function () {
      var y = global.scrollY + 120;
      var current = null;
      sections.forEach(function (s) {
        if (s.el.offsetTop <= y) current = s;
      });
      links.forEach(function (a) {
        a.classList.remove('is-active');
        a.removeAttribute('aria-current');
      });
      if (current) {
        current.a.classList.add('is-active');
        current.a.setAttribute('aria-current', 'true');
      }
    });
    setActive();
    global.addEventListener('scroll', setActive, { passive: true });
  }

  /* ----- Payment processing + success overlays ----- */
  function ensureOverlays() {
    if (!qs('#dgPayOverlay')) {
      var pay = doc.createElement('div');
      pay.id = 'dgPayOverlay';
      pay.className = 'dg-overlay';
      pay.setAttribute('role', 'status');
      pay.setAttribute('aria-live', 'polite');
      pay.innerHTML =
        '<div class="dg-overlay-card">' +
        '<div class="dg-spinner" aria-hidden="true"></div>' +
        '<h3>Processing Secure Payment</h3>' +
        '<p>Please wait while we verify your payment with Razorpay. Do not close this window.</p>' +
        '</div>';
      doc.body.appendChild(pay);
    }
    if (!qs('#dgSuccessOverlay')) {
      var ok = doc.createElement('div');
      ok.id = 'dgSuccessOverlay';
      ok.className = 'dg-overlay';
      ok.setAttribute('role', 'dialog');
      ok.setAttribute('aria-modal', 'true');
      ok.setAttribute('aria-labelledby', 'dgSuccessTitle');
      ok.innerHTML =
        '<div class="dg-overlay-card">' +
        '<div class="dg-success-mark" aria-hidden="true">✓</div>' +
        '<h3 id="dgSuccessTitle">Payment Successful</h3>' +
        '<p id="dgSuccessSub">Thank you! Our team will contact you shortly.</p>' +
        '<div class="dg-success-meta" id="dgSuccessMeta"></div>' +
        '<div class="dg-success-actions">' +
        '<a class="btn primary" href="index.html">Continue to Home</a>' +
        '<a class="btn btn-wa" href="https://wa.me/917428329102" target="_blank" rel="noopener">WhatsApp Support</a>' +
        '<button type="button" class="btn ghost" id="dgSuccessClose">Close</button>' +
        '</div></div>';
      doc.body.appendChild(ok);
      ok.addEventListener('click', function (e) {
        if (e.target === ok) hideSuccess();
      });
      var closeBtn = qs('#dgSuccessClose', ok);
      if (closeBtn) closeBtn.addEventListener('click', hideSuccess);
    }
  }

  function showProcessing() {
    ensureOverlays();
    var el = qs('#dgPayOverlay');
    if (el) el.classList.add('is-open');
  }

  function hideProcessing() {
    var el = qs('#dgPayOverlay');
    if (el) el.classList.remove('is-open');
  }

  function row(label, value) {
    if (!value) return '';
    return (
      '<div><span>' +
      label +
      '</span><span>' +
      String(value).replace(/</g, '&lt;') +
      '</span></div>'
    );
  }

  function showSuccess(details) {
    ensureOverlays();
    hideProcessing();
    details = details || {};
    var title = qs('#dgSuccessTitle');
    var sub = qs('#dgSuccessSub');
    var meta = qs('#dgSuccessMeta');
    var paid = Boolean(details.paymentId || details.orderId);
    if (title) title.textContent = paid ? 'Payment Successful' : 'Request Received';
    if (sub) {
      sub.textContent = paid
        ? 'Your payment was verified securely. Our team will contact you shortly.'
        : 'Thank you! Our team will contact you shortly.';
    }
    if (meta) {
      meta.innerHTML =
        row('Customer Name', details.customerName) +
        row('Purchased Plan', details.plan) +
        row('Payment ID', details.paymentId) +
        row('Order ID', details.orderId) +
        row('Amount', details.amount);
    }
    var el = qs('#dgSuccessOverlay');
    if (el) el.classList.add('is-open');
  }

  function hideSuccess() {
    var el = qs('#dgSuccessOverlay');
    if (el) el.classList.remove('is-open');
  }

  /* ----- Reveal polish (non-destructive) ----- */
  function bindReveals() {
    if (!('IntersectionObserver' in global)) return;
    var nodes = qsa('.reveal:not(.dg-io-bound)');
    if (!nodes.length) return;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('visible');
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    nodes.forEach(function (n) {
      n.classList.add('dg-io-bound');
      io.observe(n);
    });
  }

  function init() {
    bindRipples();
    bindHeaderScroll();
    bindActiveNav();
    bindReveals();
    ensureOverlays();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.DropshipGuruUI = {
    showProcessing: showProcessing,
    hideProcessing: hideProcessing,
    showSuccess: showSuccess,
    hideSuccess: hideSuccess,
    bindRipples: bindRipples,
  };
})(typeof window !== 'undefined' ? window : globalThis);
