'use strict';

const { AppError } = require('./errorHandler');

function requireFields(fields) {
  return (req, _res, next) => {
    const body = req.body || {};
    const missing = fields.filter((field) => {
      const value = body[field];
      return value === undefined || value === null || value === '';
    });

    if (missing.length) {
      return next(
        new AppError(
          `Missing required fields: ${missing.join(', ')}`,
          400,
          'VALIDATION_ERROR',
          { missing }
        )
      );
    }

    return next();
  };
}

function parseAmountToPaise(amountInr) {
  const n = Number(amountInr);
  if (!Number.isFinite(n) || n <= 0) {
    throw new AppError('amount must be a positive number (INR)', 400, 'INVALID_AMOUNT');
  }
  return Math.round(n * 100);
}

module.exports = { requireFields, parseAmountToPaise };
