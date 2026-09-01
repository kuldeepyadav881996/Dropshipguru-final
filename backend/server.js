'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { loadEnv } = require('./config/env');
const { createApiRouter } = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Loads dotenv + validates RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET from .env
const env = loadEnv();
const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (no Origin) and configured frontends
      if (!origin || env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400,
  })
);

app.use(
  morgan(env.isProd ? 'combined' : 'dev', {
    skip: (req) => req.path === '/health' || req.path === '/api/health',
  })
);

// Capture raw body for Razorpay webhook HMAC verification
app.use(
  express.json({
    limit: '1mb',
    verify: (req, _res, buf) => {
      if (req.originalUrl && req.originalUrl.includes('/api/payment/webhook')) {
        req.rawBody = Buffer.from(buf);
      }
    },
  })
);
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'dropshipguru-backend',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', createApiRouter(env));

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(env.port, () => {
  console.info(
    `[dropshipguru-backend] listening on :${env.port} (${env.nodeEnv})`
  );
});

function shutdown(signal) {
  console.info(`[dropshipguru-backend] ${signal} received, shutting down…`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;
