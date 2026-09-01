'use strict';

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = undefined) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
  }
}

function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
}

function errorHandler(err, req, res, _next) {
  const statusCode = Number(err.statusCode) || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const isProd = process.env.NODE_ENV === 'production';

  if (statusCode >= 500) {
    console.error('[error]', {
      message: err.message,
      code,
      stack: isProd ? undefined : err.stack,
      path: req.originalUrl,
      method: req.method,
    });
  }

  const payload = {
    success: false,
    error: {
      code,
      message:
        statusCode >= 500 && isProd
          ? 'An unexpected error occurred'
          : err.message || 'Request failed',
    },
  };

  if (!isProd && err.details) {
    payload.error.details = err.details;
  }

  res.status(statusCode).json(payload);
}

module.exports = { AppError, notFoundHandler, errorHandler };
