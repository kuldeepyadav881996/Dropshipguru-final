/**
 * DropshipGuru — Google Sheets lead submit (free / unpaid path)
 * Public Apps Script deployment only (never workspace-scoped macro URLs).
 */
(function (global) {
  'use strict';

  var GOOGLE_SCRIPT_URL =
    'https://script.google.com/macros/s/AKfycbzpPiH8gpzHvk9-AEHEKDq5WT7XnEsfJVIIz-ki3-BCprd4xLGaNQ2FJFHoyfy-qtlafQ/exec';

  var PAYLOAD_KEYS = [
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
    'price',
    'budget',
    'message',
    'source',
  ];

  function emptyPayload() {
    return {
      fullName: '',
      mobile: '',
      email: '',
      state: '',
      profession: '',
      selectedType: '',
      selectedPlan: '',
      selectedCourse: '',
      selectedService: '',
      selectedPlatform: '',
      price: '',
      budget: '',
      message: '',
      source: 'Website',
    };
  }

  function normalizePayload(data) {
    var base = emptyPayload();
    var input = data || {};
    PAYLOAD_KEYS.forEach(function (key) {
      if (Object.prototype.hasOwnProperty.call(input, key) && input[key] != null) {
        base[key] = String(input[key]);
      }
    });
    if (!base.source) base.source = 'Website';
    return base;
  }

  function formatPrice(amount) {
    if (amount == null || amount === '') return '';
    var text = String(amount).trim();
    if (!text) return '';
    if (text.indexOf('₹') !== -1) return text;
    var raw = text.replace(/[^\d.]/g, '');
    if (!raw) return text;
    return '₹' + Number(raw).toLocaleString('en-IN');
  }

  function resolveSelectedType(ctx) {
    if (ctx.selectedType) return String(ctx.selectedType).toUpperCase();

    var params = new URLSearchParams(
      global.location && global.location.search ? global.location.search : ''
    );
    var courseParam = params.get('course');
    var planParam = params.get('plan');
    var serviceParam = params.get('service');

    if (courseParam || (ctx.selectedItem && ctx.selectedItem.kind === 'course')) {
      return 'COURSE';
    }
    if (planParam || (ctx.selectedItem && ctx.selectedItem.kind === 'plan')) {
      return 'PLAN';
    }
    if (serviceParam || (ctx.selectedItem && ctx.selectedItem.kind === 'service')) {
      return 'SERVICE';
    }
    if (ctx.selectedPlatformName) {
      return 'PLATFORM';
    }
    return 'CONSULTATION';
  }

  function buildFormPayload(ctx) {
    var payload = emptyPayload();
    var profession = ctx.profession || '';
    var bizExp = ctx.businessExperience || '';
    var budget = ctx.budget || '';
    var msg = ctx.message || '';
    var parts = [];

    if (bizExp) parts.push('Business Experience: ' + bizExp);
    if (parts.length) {
      msg = (parts.join(' | ') + (msg ? '\n' + msg : '')).trim();
    }

    var selectedType = resolveSelectedType(ctx);
    var selectedItem = ctx.selectedItem || null;
    var itemName = selectedItem && selectedItem.name ? selectedItem.name : '';
    var itemPrice =
      (selectedItem && (selectedItem.displayAmount || selectedItem.price)) || '';

    payload.fullName = ctx.fullName || '';
    payload.mobile = ctx.mobile || '';
    payload.email = ctx.email || '';
    payload.state = ctx.state || '';
    payload.profession = profession;
    payload.selectedType = selectedType;
    payload.budget = budget;
    payload.message = msg;
    payload.source = 'Website';

    if (selectedType === 'PLAN') {
      payload.selectedPlan = itemName;
      payload.price = formatPrice(itemPrice);
    } else if (selectedType === 'COURSE') {
      payload.selectedCourse = itemName;
      payload.price = formatPrice(itemPrice);
    } else if (selectedType === 'SERVICE') {
      payload.selectedService = itemName;
      payload.price = formatPrice(itemPrice);
    } else if (selectedType === 'PLATFORM') {
      payload.selectedPlatform = ctx.selectedPlatformName || '';
      payload.price = ctx.selectedPlatformPrice
        ? formatPrice(ctx.selectedPlatformPrice)
        : formatPrice(ctx.displayedPrice || '');
    }

    return normalizePayload(payload);
  }

  function submitToGoogleSheet(data) {
    var payload = normalizePayload(data);
    var params = new URLSearchParams();
    Object.keys(payload).forEach(function (key) {
      params.append(key, payload[key]);
    });

    return fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: params,
    }).then(function (res) {
      return res.text().then(function (text) {
        var json = null;
        if (text) {
          try {
            json = JSON.parse(text);
          } catch (_e) {
            json = null;
          }
        }
        var ok =
          res.ok &&
          !(json && (json.success === false || json.status === 'error'));
        if (!ok) {
          var err = new Error(
            (json && (json.message || json.error)) || 'Submission failed'
          );
          err.response = res;
          err.body = json;
          throw err;
        }
        return { ok: true, status: res.status, body: json, text: text, payload: payload };
      });
    });
  }

  global.GOOGLE_SCRIPT_URL = GOOGLE_SCRIPT_URL;
  global.GoogleSheetSubmit = {
    URL: GOOGLE_SCRIPT_URL,
    PAYLOAD_KEYS: PAYLOAD_KEYS,
    emptyPayload: emptyPayload,
    normalizePayload: normalizePayload,
    buildFormPayload: buildFormPayload,
    buildConsultationPayload: buildFormPayload,
    submitToGoogleSheet: submitToGoogleSheet,
    formatPrice: formatPrice,
    resolveSelectedType: resolveSelectedType,
  };
})(typeof window !== 'undefined' ? window : globalThis);
