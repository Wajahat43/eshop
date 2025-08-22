import express from 'express';
import { createPaymentIntent, createPaymentSession, verifyPaymentSession } from '../controller/order.controller';
import { validateCreatePaymentSession, validateCreatePaymentIntent } from '../middleware/validation';
import isAuthenticated from '@packages/middleware/isAuthenticated';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    message: 'Order service is running!',
    timestamp: new Date().toISOString(),
    service: 'order-service',
  });
});

// Payment routes with validation
router.post('/create-payment-intent', validateCreatePaymentIntent, isAuthenticated, createPaymentIntent);
router.post('/create-payment-session', validateCreatePaymentSession, createPaymentSession);

// Session verification route
router.get('/verify-session/:sessionId', verifyPaymentSession);

export default router;
