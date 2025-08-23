import express from 'express';
import {
  createPaymentIntent,
  createPaymentSession,
  verifyPaymentSession,
  getSellerOrders,
  getOrderDetails,
  updateOrderStatus,
  getUserOrders,
} from '../controller/order.controller';
import { validateCreatePaymentSession, validateCreatePaymentIntent } from '../middleware/validation';
import isAuthenticated from '@packages/middleware/isAuthenticated';
import { isSeller, isUser } from '@packages/middleware/authorizeRoles';

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

// Seller routes
router.get('/get-seller-orders', isAuthenticated, isSeller, getSellerOrders);
router.get('/get-order-details/:orderId', isAuthenticated, getOrderDetails);
router.patch('/update-order-status/:orderId', isAuthenticated, isSeller, updateOrderStatus);

// User routes
router.get('/get-user-orders', isAuthenticated, isUser, getUserOrders);

export default router;
