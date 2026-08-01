'use strict';

const express = require('express');
const { createPaymentRouter } = require('./paymentRoutes');
const paymentController = require('../controllers/paymentController');

function createApiRouter(env) {
  const router = express.Router();

  router.get('/health', paymentController.health);
  router.use('/payment', createPaymentRouter(env));

  return router;
}

module.exports = { createApiRouter };
