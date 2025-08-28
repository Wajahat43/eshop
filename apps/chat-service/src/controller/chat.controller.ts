import { Request, Response } from 'express';
import prisma from '@packages/libs/prisma';
import { getUnseenCount, clearUnseenCount } from '@packages/libs/redis/message.redis';
import redis from '@packages/libs/redis';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
  seller?: {
    id: string;
  };
}

interface CreateConversationRequest {
  sellerId: string;
}

interface PaginationQuery {
  page?: string;
  limit?: string;
}

/**
 * Create a new conversation between user and seller
 */
export const createConversation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sellerId } = req.body as CreateConversationRequest;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!sellerId) {
      return res.status(400).json({ error: 'Seller ID is required' });
    }

    //Validate both user and seller exsist in db
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });
    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
    });
    if (!user || !seller) {
      return res.status(400).json({ error: 'User or seller not found' });
    }

    // Check if existing conversation exists
    const existingConversation = await prisma.conversationGroup.findFirst({
      where: {
        isGroup: false,
        participantIds: {
          hasEvery: [userId, sellerId],
        },
      },
    });

    if (existingConversation) {
      // Get participants for existing conversation
      const participants = await prisma.participant.findMany({
        where: { conversationId: existingConversation.id },
      });

      return res.status(200).json({
        conversation: { ...existingConversation, participants },
        isNew: false,
      });
    }

    // Create new conversation
    const newConversation = await prisma.conversationGroup.create({
      data: {
        isGroup: false,
        participantIds: [userId, sellerId],
        creatorId: userId,
      },
    });

    // Create participants
    await prisma.participant.createMany({
      data: [
        {
          conversationId: newConversation.id,
          userId: userId,
        },
        {
          conversationId: newConversation.id,
          sellerId: sellerId,
        },
      ],
    });

    // Get participants for new conversation
    const participants = await prisma.participant.findMany({
      where: { conversationId: newConversation.id },
    });

    return res.status(201).json({
      conversation: { ...newConversation, participants },
      isNew: true,
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get conversations for a user
 */
export const getUserConversations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get conversations where user is a participant
    const conversations = await prisma.conversationGroup.findMany({
      where: {
        participantIds: {
          has: userId,
        },
        isGroup: false,
      },
    });

    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation) => {
        // Get participants for this conversation
        const participants = await prisma.participant.findMany({
          where: { conversationId: conversation.id },
        });

        // Get seller participant
        const sellerParticipant = participants.find((p) => p.sellerId && p.sellerId !== userId);

        if (!sellerParticipant?.sellerId) {
          return null;
        }

        // Get seller info
        const seller = await prisma.sellers.findUnique({
          where: { id: sellerParticipant.sellerId },
          select: {
            id: true,
            name: true,
            email: true,
          },
        });

        // Get last message
        const lastMessage = await prisma.message.findFirst({
          where: { conversationId: conversation.id },
          orderBy: { createdAt: 'desc' },
        });

        // Check online status from Redis
        const sellerKey = `user:${sellerParticipant.sellerId}`;
        const isOnline = (await redis.get(sellerKey)) === '1';

        // Get unseen count for this user
        const unseenCount = await getUnseenCount('user', conversation.id);

        return {
          id: conversation.id,
          seller: seller,
          lastMessage: lastMessage,
          isOnline,
          unseenCount,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        };
      }),
    );

    const validConversations = conversationsWithDetails.filter(Boolean);

    return res.status(200).json({
      conversations: validConversations,
    });
  } catch (error) {
    console.error('Error getting user conversations:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get conversations for a seller
 */
export const getSellerConversations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellerId = req.seller?.id;

    if (!sellerId) {
      return res.status(401).json({ error: 'Seller not authenticated' });
    }

    // Get conversations where seller is a participant
    const conversations = await prisma.conversationGroup.findMany({
      where: {
        participantIds: {
          has: sellerId,
        },
        isGroup: false,
      },
    });

    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation) => {
        // Get participants for this conversation
        const participants = await prisma.participant.findMany({
          where: { conversationId: conversation.id },
        });

        // Get user participant
        const userParticipant = participants.find((p) => p.userId && p.userId !== sellerId);

        if (!userParticipant?.userId) {
          return null;
        }

        // Get user info
        const user = await prisma.users.findUnique({
          where: { id: userParticipant.userId },
          select: {
            id: true,
            name: true,
            email: true,
          },
        });

        // Get last message
        const lastMessage = await prisma.message.findFirst({
          where: { conversationId: conversation.id },
          orderBy: { createdAt: 'desc' },
        });

        // Check online status from Redis
        const userKey = `user:${userParticipant.userId}`;
        const isOnline = (await redis.get(userKey)) === '1';

        // Get unseen count for this seller
        const unseenCount = await getUnseenCount('seller', conversation.id);

        return {
          id: conversation.id,
          user: user,
          lastMessage: lastMessage,
          isOnline,
          unseenCount,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        };
      }),
    );

    const validConversations = conversationsWithDetails.filter(Boolean);

    return res.status(200).json({
      conversations: validConversations,
    });
  } catch (error) {
    console.error('Error getting seller conversations:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Fetch messages for a user with pagination
 */
export const fetchUserMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;
    const { page = '1', limit = '20' } = req.query as PaginationQuery;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID is required' });
    }

    // Check if user has access to this conversation
    const conversation = await prisma.conversationGroup.findFirst({
      where: {
        id: conversationId,
        participantIds: {
          has: userId,
        },
      },
    });

    if (!conversation) {
      return res.status(403).json({ error: 'Access denied to this conversation' });
    }

    // Clear unseen count for this user
    await clearUnseenCount('user', conversationId);

    // Get seller participant and info
    const sellerParticipant = await prisma.participant.findFirst({
      where: {
        conversationId,
        sellerId: { not: null },
      },
    });

    const seller = sellerParticipant?.sellerId
      ? await prisma.sellers.findUnique({
          where: { id: sellerParticipant.sellerId },
          select: {
            id: true,
            name: true,
            email: true,
          },
        })
      : null;

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const totalMessages = await prisma.message.count({
      where: { conversationId },
    });

    // Fetch paginated messages (latest first)
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    });

    // Reverse to get chronological order (oldest first)
    const orderedMessages = messages.reverse();

    const hasMore = skip + limitNum < totalMessages;

    return res.status(200).json({
      messages: orderedMessages,
      seller,
      currentPage: pageNum,
      hasMore,
      totalMessages,
    });
  } catch (error) {
    console.error('Error fetching user messages:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Fetch messages for a seller with pagination
 */
export const fetchSellerMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellerId = req.seller?.id;
    const { conversationId } = req.params;
    const { page = '1', limit = '20' } = req.query as PaginationQuery;

    if (!sellerId) {
      return res.status(401).json({ error: 'Seller not authenticated' });
    }

    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID is required' });
    }

    // Check if seller has access to this conversation
    const conversation = await prisma.conversationGroup.findFirst({
      where: {
        id: conversationId,
        participantIds: {
          has: sellerId,
        },
      },
    });

    if (!conversation) {
      return res.status(403).json({ error: 'Access denied to this conversation' });
    }

    // Clear unseen count for this seller
    await clearUnseenCount('seller', conversationId);

    // Get user participant and info
    const userParticipant = await prisma.participant.findFirst({
      where: {
        conversationId,
        userId: { not: null },
      },
    });

    const user = userParticipant?.userId
      ? await prisma.users.findUnique({
          where: { id: userParticipant.userId },
          select: {
            id: true,
            name: true,
            email: true,
          },
        })
      : null;

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const totalMessages = await prisma.message.count({
      where: { conversationId },
    });

    // Fetch paginated messages (latest first)
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    });

    // Reverse to get chronological order (oldest first)
    const orderedMessages = messages.reverse();

    const hasMore = skip + limitNum < totalMessages;

    return res.status(200).json({
      messages: orderedMessages,
      user,
      currentPage: pageNum,
      hasMore,
      totalMessages,
    });
  } catch (error) {
    console.error('Error fetching seller messages:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
