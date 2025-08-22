import Stripe from 'stripe';
import redis from '@packages/libs/redis';

import prisma from '@packages/libs/prisma';
import crypto from 'crypto';
import { processOrdersForAllShops } from '../utils/order.utils';
import { generateCartHash, normalizeCart } from '../utils/cart.utils';
import { CartItem, SellerData, PaymentSession, Coupon } from '../types';
import { Request, Response, NextFunction } from 'express';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Request interfaces
interface CreatePaymentSessionRequest extends Request {
  body: {
    cart: CartItem[];
    userId: string;
    selectedAddressId?: string;
    coupon?: Coupon;
  };
}

interface CreatePaymentIntentRequest extends Request {
  body: {
    amount: number;
    stripeSellerAccountId: string;
    sessionId: string;
  };
  user?: {
    id: string;
  };
}

interface VerifySessionRequest extends Request {
  params: {
    sessionId: string;
  };
}

interface WebhookRequest extends Request {
  headers: {
    'stripe-signature': string;
  };
  rawBody: Buffer;
}

/**
 * Helper method to retrieve session data from Redis
 */
const retrieveSessionData = async (
  sessionId: string,
): Promise<{
  sessionData: PaymentSession | null;
  sessionKey: string;
}> => {
  const sessionKey = `payment_session:${sessionId}`;
  const session = await redis?.get(sessionKey);

  if (session) {
    return { sessionData: JSON.parse(session), sessionKey };
  }

  return { sessionData: null, sessionKey };
};

/**
 * Helper method to clean up orphaned cart-to-session mappings
 */
const cleanupCartMapping = async (userId: string, cart: CartItem[]): Promise<void> => {
  try {
    if (!redis || !cart || cart.length === 0) return;

    const normalizedCart = normalizeCart(cart);
    const cartHash = generateCartHash(normalizedCart);
    const cartSessionKey = `cart_session:${userId}:${cartHash}`;

    await redis.del(cartSessionKey);
  } catch (error) {
    console.error('Error cleaning up cart mapping:', error);
  }
};

/**
 * Verify payment session by session ID
 */
export const verifyPaymentSession = async (req: VerifySessionRequest, res: Response) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
    }

    // Check if Redis is available
    if (!redis) {
      return res.status(500).json({
        success: false,
        message: 'Redis service unavailable',
      });
    }

    // Retrieve session data using simplified helper
    const { sessionData, sessionKey } = await retrieveSessionData(sessionId);

    if (!sessionData) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or expired',
      });
    }

    // Check if session is expired (Redis TTL)
    const ttl = await redis?.ttl(sessionKey);
    if (ttl === -1 || ttl === -2) {
      return res.status(410).json({
        success: false,
        message: 'Session expired',
      });
    }

    return res.status(200).json({
      success: true,
      session: {
        sessionId: sessionData.sessionId,
        cart: sessionData.cart,
        totalAmount: sessionData.totalAmount,
        shippingAddressId: sessionData.shippingAddressId,
        coupon: sessionData.coupon,
        sellers: sessionData.sellers,
      },
    });
  } catch (error) {
    console.error('Error verifying payment session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment session',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createPaymentIntent = async (req: CreatePaymentIntentRequest, res: Response) => {
  try {
    const { amount, stripeSellerAccountId, sessionId } = req.body;

    // Validate required fields
    if (!amount || !stripeSellerAccountId || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: amount, stripeSellerAccountId, sessionId',
      });
    }

    // Calculate amounts
    const customerAmount = Math.round(amount * 100);

    // Create payment intent
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: customerAmount,
    //   currency: 'usd',
    //   payment_method_types: ['card'],
    //   application_fee_amount: platformFee,
    //   on_behalf_of: stripeSellerAccountId, //To fix cross border issue
    //   metadata: {
    //     sessionId,
    //     userId: req.user?.id || 'anonymous',
    //   },
    // });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: customerAmount,
      currency: 'usd',
      payment_method_types: ['card'],
      on_behalf_of: stripeSellerAccountId, //To fix cross border issue
      metadata: {
        sessionId,
        userId: req.user?.id || 'anonymous',
      },
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Create payment session with duplicate prevention
 *
 * This function prevents duplicate sessions by:
 * 1. Normalizing the cart (removing duplicates, sorting)
 * 2. Generating a hash of the normalized cart
 * 3. Checking if a session already exists for this user+cart combination
 * 4. If exists and valid, return existing session ID
 * 5. If not, create new session and store both session data and cart mapping
 *
 * Redis keys used:
 * - `payment_session:{sessionId}` - stores session data
 * - `cart_session:{userId}:{cartHash}` - maps user+cart to session ID
 */
export const createPaymentSession = async (req: CreatePaymentSessionRequest, res: Response) => {
  try {
    const { cart, userId, selectedAddressId, coupon } = req.body;

    // Validate required fields
    if (!cart || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: cart, userId',
      });
    }

    // Validate cart is not empty
    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart cannot be empty',
      });
    }

    // Check if Redis is available
    if (!redis) {
      return res.status(500).json({
        success: false,
        message: 'Redis service unavailable',
      });
    }

    // Normalize cart and generate hash to check for existing sessions
    const normalizedCart = normalizeCart(cart);
    const cartHash = generateCartHash(normalizedCart);
    const cartSessionKey = `cart_session:${userId}:${cartHash}`;

    // Check if a session already exists for this user-cart combination
    const existingSessionId = await redis.get(cartSessionKey);
    if (existingSessionId) {
      // Verify the session still exists and is valid
      const { sessionData } = await retrieveSessionData(existingSessionId);
      if (sessionData) {
        return res.status(200).json({
          success: true,
          sessionId: existingSessionId,
          isExisting: true,
        });
      } else {
        // Session expired, clean up the cart mapping
        await redis.del(cartSessionKey);
      }
    }

    // Fetch sellers and their stripe account. Order might be from two different shops.
    const uniqueShopIds = [...new Set(normalizedCart.map((item: CartItem) => item.shopId))];
    const shops = await prisma.shops.findMany({
      where: {
        id: { in: uniqueShopIds },
      },
      select: {
        id: true,
        sellerId: true,
        sellers: {
          select: {
            stripeId: true,
          },
        },
      },
    });

    if (shops.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No valid shops found for the cart items',
      });
    }

    const sellerData: SellerData[] = shops.map((shop) => ({
      shopId: shop.id,
      sellerId: shop.sellerId,
      stripeAccountId: shop?.sellers?.stripeId || undefined,
    }));

    // Calculate cart total using normalized cart
    const cartTotal = normalizedCart.reduce((acc: number, item: CartItem) => acc + item.sale_price * item.quantity, 0);

    // Generate unique session ID
    const sessionId = crypto.randomUUID();

    // Create session payload using normalized cart\
    //TODO: should we use car
    const sessionData: PaymentSession = {
      userId,
      sessionId,
      cart: cart,
      sellers: sellerData,
      totalAmount: cartTotal,
      shippingAddressId: selectedAddressId || undefined,
      coupon: coupon || undefined,
    };

    // Store session with simple key structure and 10-minute expiration
    const sessionKey = `payment_session:${sessionId}`;
    await redis.setex(sessionKey, 600, JSON.stringify(sessionData));

    // Store cart-to-session mapping with same expiration
    await redis.setex(cartSessionKey, 600, sessionId);

    return res.status(201).json({
      success: true,
      sessionId,
      isExisting: false,
    });
  } catch (error) {
    console.error('Error creating payment session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment session',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createOrder = async (req: WebhookRequest, res: Response, next: NextFunction) => {
  try {
    const stripeSignature = req.headers['stripe-signature'];
    const rawBody = req.rawBody;
    if (!stripeSignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing stripe signature',
      });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, stripeSignature, process.env.STRIPE_WEBHOOK_SECRET as string);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Webhook signature verification failed:', errorMessage);
      return res.status(400).send(`Webhook Error: ${errorMessage}`);
    }

    if (event.type !== 'payment_intent.succeeded') {
      return res.status(200).json({ received: true });
    }

    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const sessionId = paymentIntent.metadata.sessionId;
    const userId = paymentIntent.metadata.userId;

    if (!sessionId || !userId) {
      console.error('Missing sessionId or userId in payment intent metadata');
      return res.status(400).json({
        success: false,
        message: 'Invalid payment intent metadata',
      });
    }

    // Find the session using simplified retrieval
    const { sessionData, sessionKey } = await retrieveSessionData(sessionId);

    if (!sessionData || !sessionKey) {
      console.error('Session not found for sessionId:', sessionId);
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Get user information
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!user) {
      console.error('User not found:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    try {
      // Process all orders using utility function
      await processOrdersForAllShops(sessionData, user);

      // Clean up session data and cart mapping
      await redis?.del(sessionKey);
      await cleanupCartMapping(userId, sessionData.cart);
    } catch (orderError) {
      console.error('Error processing orders:', orderError);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error in createOrder webhook:', error);
    return next(error);
  }
};
