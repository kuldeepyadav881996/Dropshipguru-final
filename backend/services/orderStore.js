'use strict';

// ============================================================
// In-memory order store for PhonePe checkout sessions.
//
// Holds checkout sessions so a double-clicked Pay button reuses one PhonePe
// order instead of creating two. Google Sheet fulfilment is not connected yet.
//
// Single-instance only. If the backend is ever scaled to more than
// one process/dyno, swap this for Redis or a database table — the
// public function signatures are intentionally async-friendly.
// ============================================================

const ORDER_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const SWEEP_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ORDERS = 5000;

const orders = new Map();

function now() {
  return Date.now();
}

function isExpired(record) {
  return now() - record.createdAt > ORDER_TTL_MS;
}

function sweep() {
  orders.forEach((record, key) => {
    if (isExpired(record)) orders.delete(key);
  });

  // Hard cap so a flood of abandoned checkouts cannot grow the heap.
  if (orders.size > MAX_ORDERS) {
    const excess = orders.size - MAX_ORDERS;
    const keys = Array.from(orders.keys()).slice(0, excess);
    keys.forEach((key) => orders.delete(key));
  }
}

const sweeper = setInterval(sweep, SWEEP_INTERVAL_MS);

if (typeof sweeper.unref === 'function') sweeper.unref();

function create(merchantOrderId, data) {
  const record = {
    merchantOrderId,
    amountPaise: data.amountPaise,
    customer: data.customer || {},
    idempotencyKey: data.idempotencyKey || null,
    checkoutUrl: data.checkoutUrl || null,
    state: 'CREATED',
    fulfilled: false,
    fulfilling: false,
    sheetSaved: false,
    createdAt: now(),
    updatedAt: now(),
  };

  orders.set(merchantOrderId, record);

  return record;
}

function get(merchantOrderId) {
  const record = orders.get(merchantOrderId);

  if (!record) return null;

  if (isExpired(record)) {
    orders.delete(merchantOrderId);
    return null;
  }

  return record;
}

/**
 * Find a still-usable checkout session for the same idempotency key so a
 * double-clicked Pay button reuses one PhonePe order instead of creating two.
 */
function findReusableByIdempotencyKey(idempotencyKey) {
  if (!idempotencyKey) return null;

  let found = null;

  orders.forEach((record) => {
    if (found) return;

    if (
      record.idempotencyKey === idempotencyKey &&
      !isExpired(record) &&
      !record.fulfilled &&
      (record.state === 'CREATED' || record.state === 'PENDING') &&
      record.checkoutUrl
    ) {
      found = record;
    }
  });

  return found;
}

function update(merchantOrderId, patch) {
  const record = get(merchantOrderId);

  if (!record) return null;

  Object.assign(record, patch, { updatedAt: now() });

  return record;
}

/**
 * Claim the exclusive right to fulfil an order.
 * Returns true only for the first caller; the status endpoint and the
 * webhook can therefore both race without double-writing the sheet.
 */
function claimFulfilment(merchantOrderId) {
  const record = get(merchantOrderId);

  if (!record) return false;
  if (record.fulfilled || record.fulfilling) return false;

  record.fulfilling = true;
  record.updatedAt = now();

  return true;
}

function releaseFulfilment(merchantOrderId, fulfilled, sheetSaved) {
  const record = get(merchantOrderId);

  if (!record) return null;

  record.fulfilling = false;
  record.fulfilled = Boolean(fulfilled);
  record.sheetSaved = Boolean(sheetSaved);
  record.updatedAt = now();

  return record;
}

module.exports = {
  ORDER_TTL_MS,
  create,
  get,
  update,
  findReusableByIdempotencyKey,
  claimFulfilment,
  releaseFulfilment,
};
