import express from 'express';
import {
  createConversation,
  getUserConversations,
  getSellerConversations,
  fetchUserMessages,
  fetchSellerMessages,
} from '../controller/chat.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    message: 'Chat service is running!',
    timestamp: new Date().toISOString(),
    service: 'chat-service',
  });
});

// Create a new conversation between user and seller
router.post('/create-conversation', isAuthenticated, createConversation);

// Get conversations for a user
router.get('/get-user-conversations', isAuthenticated, getUserConversations);

// Get conversations for a seller
router.get('/get-seller-conversations', isAuthenticated, getSellerConversations);

// Fetch messages for a user with pagination
router.get('/get-user-messages/:conversationId', isAuthenticated, fetchUserMessages);

// Fetch messages for a seller with pagination
router.get('/get-seller-messages/:conversationId', isAuthenticated, fetchSellerMessages);

export default router;
