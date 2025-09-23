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

export interface WebhookRequest extends Request {
  headers: {
    'stripe-signature': string;
  };
  rawBody: Buffer;
}

interface GetOrderDetailsRequest extends Request {
  params: {
    orderId: string;
  };
}

interface UpdateOrderStatusRequest extends Request {
  params: {
    orderId: string;
  };
  body: {
    status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
    trackingNumber?: string;
    estimatedDelivery?: string;
  };
  seller?: {
    id: string;
    shop?: any;
  };
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

    // Create payment intent this gives error of not being able to create payment intent on behalf of the seller
    // because of different regions.
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

export const createOrder = async (request: WebhookRequest, response: Response, next: NextFunction) => {
  try {
    const signature = request.headers['stripe-signature'];

    if (!signature) {
      console.error('Stripe webhook received without signature header');
      return response.status(400).send('Webhook Error: missing stripe-signature header');
    }

    const rawBody = (request as any).rawBody ?? request.body;

    if (!rawBody) {
      console.error('Stripe webhook received without raw body');
      return response.status(400).send('Webhook Error: missing raw body');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET as string);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Stripe webhook signature verification failed:', errorMessage);
      return response.status(400).send(`Webhook Error: ${errorMessage}`);
    }

    if (event.type !== 'payment_intent.succeeded') {
      console.log(`Ignoring Stripe event ${event.type}`);
      return response.status(200).json({ received: true });
    }

    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const sessionId = paymentIntent.metadata.sessionId;
    const userId = paymentIntent.metadata.userId;

    if (!sessionId || !userId) {
      console.error('Stripe payment intent missing sessionId or userId metadata', {
        paymentIntentId: paymentIntent.id,
        metadata: paymentIntent.metadata,
      });
      return response.status(400).json({
        success: false,
        message: 'Invalid payment intent metadata',
      });
    }

    const { sessionData, sessionKey } = await retrieveSessionData(sessionId);

    if (!sessionData || !sessionKey) {
      console.error('Payment session not found for sessionId:', sessionId);
      return response.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!user) {
      console.error('User not found while processing order', { userId });
      return response.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    try {
      await processOrdersForAllShops(sessionData, user);

      await redis?.del(sessionKey);
      await cleanupCartMapping(userId, sessionData.cart);
    } catch (orderError) {
      console.error('Error while processing orders from webhook:', orderError);
      return next(orderError);
    }

    return response.status(200).json({ received: true });
  } catch (outerError) {
    console.error('Unexpected error in Stripe webhook handler:', outerError);
    return next(outerError);
  }
};
/**
 * Get orders for the logged-in seller's shop
 */
export const getSellerOrders = async (req: any, res: Response) => {
  try {
    // Check if seller and shop information exists
    if (!req.seller || !req.seller.shop) {
      return res.status(403).json({
        success: false,
        message: 'Seller shop not found',
      });
    }

    const shop = await prisma.shops.findUnique({
      where: {
        sellerId: req.seller.id,
      },
    });

    // Fetch orders for the seller's shop with user information
    const orders = await prisma.orders.findMany({
      where: {
        shopId: shop?.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: {
              select: {
                url: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      data: orders,
      total: orders.length,
    });
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch seller orders',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get orders for the logged-in user from all shops
 */
export const getUserOrders = async (req: any, res: Response) => {
  try {
    // Check if user information exists
    if (!req.user || !req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Fetch orders for the user from all shops
    const orders = await prisma.orders.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            avatar: {
              select: {
                url: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      data: orders,
      total: orders.length,
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user orders',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get order details by order ID
 */
export const getOrderDetails = async (req: GetOrderDetailsRequest, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
      });
    }

    // Fetch order with basic information
    const order = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: {
              select: {
                url: true,
              },
            },
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
            avatar: {
              select: {
                url: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Fetch order items with product details
    const orderItems = await prisma.orderItems.findMany({
      where: {
        orderId: orderId,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            images: {
              select: {
                id: true,
                url: true,
              },
            },
          },
        },
      },
    });

    // Fetch shipping address if exists
    let shippingAddress = null;
    if (order.shippingAddressId) {
      shippingAddress = await prisma.userAddresses.findUnique({
        where: {
          id: order.shippingAddressId,
        },
      });
    }

    // Fetch coupon details if exists
    let coupon = null;
    if (order.couponCode) {
      coupon = await prisma.discount_codes.findUnique({
        where: {
          discountCode: order.couponCode,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        order,
        items: orderItems,
        shippingAddress,
        coupon,
      },
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (req: UpdateOrderStatusRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, estimatedDelivery } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    // Validate status enum
    const validStatuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', '),
      });
    }

    // Check if order exists and belongs to the seller's shop
    const existingOrder = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
      include: {
        shop: {
          select: {
            id: true,
            sellerId: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify the order belongs to the seller's shop
    if (existingOrder.shop.sellerId !== req.seller?.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update orders from your own shop',
      });
    }

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // Add optional fields if provided
    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber;
    }

    if (estimatedDelivery !== undefined) {
      updateData.estimatedDelivery = new Date(estimatedDelivery);
    }

    // Update the order
    const updatedOrder = await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
