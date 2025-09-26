import { Prisma } from '@prisma/client';
import prisma from '@packages/libs/prisma';
import { CartItem, OrderData, OrderItemData, PaymentSession, UserAction } from '../types';
import { sendEmail } from './send-email';

/**
 * Group cart items by shop
 */
export const groupCartByShop = (cart: CartItem[]): Record<string, CartItem[]> => {
  return cart.reduce((acc, item) => {
    if (!acc[item.shopId]) {
      acc[item.shopId] = [];
    }
    acc[item.shopId].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);
};

/**
 * Calculate order total with coupon discount
 */
export const calculateOrderTotal = (
  items: CartItem[],
  coupon?: { discountPercent?: number; discountAmount?: number; discountedProductId?: string },
): number => {
  let total = items.reduce((sum, item) => sum + item.quantity * item.sale_price, 0);

  if (coupon?.discountedProductId && coupon.discountPercent) {
    const discountedItems = items.find((item) => item.id === coupon.discountedProductId);
    if (discountedItems) {
      const discount = (discountedItems.sale_price * discountedItems.quantity * coupon.discountPercent) / 100;
      total -= discount;
    }
  } else if (coupon?.discountAmount) {
    total -= coupon.discountAmount;
  }

  return total;
};

/**
 * Create order in database
 */
export const createOrderInDB = async (orderData: OrderData): Promise<string> => {
  const order = await prisma.orders.create({
    data: {
      userId: orderData.userId,
      shopId: orderData.shopId,
      total: orderData.total,
      status: orderData.status,
      shippingAddressId: orderData.shippingAddressId || null,
      couponCode: orderData.couponCode || null,
      discountAmount: orderData.discountAmount,
      items: {
        create: orderData.items.map((item: OrderItemData) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          selectedOptions: item.selectedOptions,
        })),
      },
    },
  });

  return order.id;
};

/**
 * Update product stock and analytics
 */
export const updateProductStockAndAnalytics = async (items: CartItem[], shopId: string): Promise<void> => {
  for (const item of items) {
    const { id: productId, quantity } = item;

    // Update product stock
    await prisma.products.update({
      where: { id: productId },
      data: {
        stock: { decrement: quantity },
        totalSales: { increment: quantity },
      },
    });

    // Update product analytics
    await prisma.productAnalytics.upsert({
      where: { productId },
      create: {
        productId,
        shopId,
        purchases: quantity,
        lastViewedAt: new Date(),
      },
      update: {
        purchases: { increment: quantity },
      },
    });
  }
};

/**
 * Update user analytics
 */
export const updateUserAnalytics = async (userId: string, items: CartItem[]): Promise<void> => {
  const newActions: UserAction[] = items.map((item) => ({
    productId: item.id,
    shopId: item.shopId,
    action: 'purchase',
    timeStamp: Date.now(),
  }));

  const existingAnalytics = await prisma.userAnalytics.findUnique({
    where: { userId },
  });

  const currentActions = Array.isArray(existingAnalytics?.actions)
    ? (existingAnalytics.actions as Prisma.JsonArray)
    : [];

  if (existingAnalytics) {
    await prisma.userAnalytics.update({
      where: { userId },
      data: {
        lastVisited: new Date(),
        actions: [...currentActions, ...newActions] as Prisma.InputJsonValue[],
      },
    });
  } else {
    await prisma.userAnalytics.create({
      data: {
        userId,
        lastVisited: new Date(),
        actions: newActions as unknown as Prisma.InputJsonValue[],
      },
    });
  }
};

/**
 * Send order confirmation email
 */
export const sendOrderConfirmationEmail = async (
  email: string,
  name: string,
  cart: CartItem[],
  totalAmount: number,
  sessionId: string,
): Promise<void> => {
  await sendEmail(email, 'Your ECart Order Confirmation', 'order-confirmation', {
    name,
    cart,
    totalAmount,
    sessionId,
    trackingUrl: `https://nextcart.com/order/${sessionId}`,
  });
};

/**
 * Create seller notification
 */
export const createSellerNotification = async (
  shopId: string,
  sellerId: string,
  userId: string,
  sessionId: string,
  productTitle: string,
): Promise<void> => {
  // Note: This will work after running Prisma generate with the updated schema
  await prisma.notifications.create({
    data: {
      title: 'New Order Received',
      message: `A customer just ordered ${productTitle}`,
      creatorId: userId,
      receiverId: sellerId,
      redirect_link: `https://nextcart.com/order/${sessionId}`,
    },
  });
};

/**
 * Create admin notification
 */
export const createAdminNotification = async (userId: string, name: string, sessionId: string): Promise<void> => {
  // Note: This will work after running Prisma generate with the updated schema
  await prisma.notifications.create({
    data: {
      title: 'New Order Received',
      message: `A new order was placed by ${name}`,
      creatorId: userId,
      receiverId: 'admin',
      redirect_link: `https://nextcart.com/order/${sessionId}`,
    },
  });
};

/**
 * Process orders for all shops in cart
 */
export const processOrdersForAllShops = async (
  sessionData: PaymentSession,
  user: { name: string; email: string },
): Promise<void> => {
  const { cart, totalAmount, shippingAddressId, coupon, sessionId, userId } = sessionData;

  // Group cart items by shop
  const shopGrouped = groupCartByShop(cart);

  // Process each shop's orders
  for (const [shopId, items] of Object.entries(shopGrouped)) {
    // Calculate order total for this shop
    const orderTotal = calculateOrderTotal(items, coupon);

    // Create order data
    const orderData: OrderData = {
      userId,
      shopId,
      total: orderTotal,
      status: 'PAID',
      shippingAddressId: shippingAddressId || undefined,
      couponCode: coupon?.code,
      discountAmount: coupon?.discountAmount || 0,
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.sale_price,
        selectedOptions: item.selectedOptions,
      })),
    };

    // Create order in database
    await createOrderInDB(orderData);

    // Update product stock and analytics
    await updateProductStockAndAnalytics(items, shopId);

    // Update user analytics
    await updateUserAnalytics(userId, items);
  }

  // Send order confirmation email
  const finalTotal = coupon?.discountAmount ? totalAmount - coupon.discountAmount : totalAmount;
  await sendOrderConfirmationEmail(user.email, user.name, cart, finalTotal, sessionId);

  // Create notifications for sellers
  for (const [shopId, items] of Object.entries(shopGrouped)) {
    const firstProduct = items[0];
    const productTitle = firstProduct?.title || 'New Item';

    // Find seller ID for this shop
    const sellerData = sessionData.sellers.find((s) => s.shopId === shopId);
    if (sellerData) {
      await createSellerNotification(shopId, sellerData.sellerId, userId, sessionId, productTitle);
    }
  }

  // Create admin notification
  await createAdminNotification(userId, user.name, sessionId);
};
