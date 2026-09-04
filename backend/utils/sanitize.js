'use strict';

// ============================================================
// Log sanitization helpers.
//
// Payment gateway errors routinely carry access tokens, checkout
// tokens and Authorization headers. Everything that reaches a log
// stream must pass through here first.
// ============================================================

const SENSITIVE_KEY_PATTERN =
  /(secret|token|authorization|auth|password|passwd|credential|salt|signature|apikey|api_key|clientsecret|client_secret|cookie|bearer)/i;

const REDACTED = '[REDACTED]';

/**
 * Strip query string and fragment from a URL so checkout tokens
 * (…/transact/uat_v2?token=<JWT>) never reach a log.
 */
function sanitizeUrl(value) {
  const raw = String(value || '').trim();

  if (!raw) return '';

  try {
    const url = new URL(raw);
    const hasQuery = Boolean(url.search || url.hash);

    return `${url.origin}${url.pathname}${hasQuery ? '?<redacted>' : ''}`;
  } catch (_err) {
    // Not an absolute URL — drop anything after the first "?" defensively.
    return raw.split('?')[0];
  }
}

/**
 * Recursively redact sensitive keys and any URL-looking string values.
 */
function sanitizeValue(value, depth = 0) {
  if (value === null || value === undefined) return value;

  if (depth > 4) return '[TRUNCATED]';

  if (typeof value === 'string') {
    return /^https?:\/\//i.test(value) ? sanitizeUrl(value) : value;
  }

  if (typeof value !== 'object') return value;

  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeValue(item, depth + 1));
  }

  const out = {};

  Object.keys(value).forEach((key) => {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      out[key] = REDACTED;
      return;
    }

    out[key] = sanitizeValue(value[key], depth + 1);
  });

  return out;
}

/**
 * Turn any thrown value (PhonePe SDK error, axios error, Error) into a
 * flat, log-safe object. Response bodies from PhonePe are useful for
 * debugging but can embed tokens, so they go through sanitizeValue().
 */
function describeError(err) {
  if (!err) return { message: 'Unknown error' };

  const out = {
    message: typeof err.message === 'string' ? err.message : String(err),
  };

  if (err.code) out.code = String(err.code);
  if (err.httpStatusCode) out.httpStatusCode = err.httpStatusCode;

  // axios-style error shape (the PhonePe SDK uses axios under the hood)
  const response = err.response;

  if (response) {
    if (response.status) out.httpStatus = response.status;
    if (response.data !== undefined) {
      out.responseBody = sanitizeValue(response.data);
    }
  }

  // PhonePe SDK PhonePeException shape
  if (err.data !== undefined && out.responseBody === undefined) {
    out.responseBody = sanitizeValue(err.data);
  }

  return out;
}

module.exports = {
  REDACTED,
  sanitizeUrl,
  sanitizeValue,
  describeError,
};
