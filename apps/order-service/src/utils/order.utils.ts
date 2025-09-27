import { Prisma } from '@prisma/client';
import prisma from '@packages/libs/prisma';
import {
  AppliedCoupon,
  AppliedCouponSummary,
  CartItem,
  Coupon,
  CouponAllocationResult,
  CouponDiscountType,
  OrderData,
  OrderItemCoupon,
  OrderItemData,
  PaymentSession,
  UserAction,
} from '../types';
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

const normalizeCouponDiscountType = (discountType: string | null | undefined): CouponDiscountType => {
  if (typeof discountType !== 'string') {
    return 'FLAT';
  }

  return discountType.toLowerCase() === 'percentage' ? 'PERCENT' : 'FLAT';
};

const mapDiscountCodeToCoupon = (discount: {
  discountCode: string;
  discountType: string | null;
  discountValue: number;
}): Coupon => {
  return {
    code: discount.discountCode,
    discountType: normalizeCouponDiscountType(discount.discountType),
    discountValue: discount.discountValue,
  };
};

const sanitizeCouponCodes = (couponCodes: string[] = []): string[] => {
  return Array.from(
    new Set(couponCodes.map((code) => (typeof code === 'string' ? code.trim() : '')).filter((code) => code.length > 0)),
  );
};

export const fetchCouponsForCart = async (
  cart: CartItem[],
  couponCodes: string[],
): Promise<{
  coupons: Coupon[];
  productCouponMap: Record<string, string[]>;
  sanitizedCouponCodes: string[];
  missingCouponCodes: string[];
}> => {
  const sanitizedCouponCodes = sanitizeCouponCodes(couponCodes);

  const productCouponMap: Record<string, string[]> = {};
  for (const item of cart) {
    if (!productCouponMap[item.id]) {
      productCouponMap[item.id] = [];
    }
  }

  if (sanitizedCouponCodes.length === 0) {
    return {
      coupons: [],
      productCouponMap,
      sanitizedCouponCodes,
      missingCouponCodes: [],
    };
  }

  const discountCodes = await prisma.discount_codes.findMany({
    where: {
      discountCode: {
        in: sanitizedCouponCodes,
      },
    },
    select: {
      id: true,
      discountCode: true,
      discountType: true,
      discountValue: true,
    },
  });

  const coupons = discountCodes.map(mapDiscountCodeToCoupon);
  const foundCodes = new Set(discountCodes.map((discount) => discount.discountCode));
  const missingCouponCodes = sanitizedCouponCodes.filter((code) => !foundCodes.has(code));

  const couponCodeById = new Map(discountCodes.map((discount) => [discount.id, discount.discountCode]));

  const productIds = Array.from(new Set(cart.map((item) => item.id)));

  if (productIds.length > 0) {
    const products = await prisma.products.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        discount_codes: true,
      },
    });

    for (const product of products) {
      const mappedCodes = (product.discount_codes ?? [])
        .map((discountId: string) => couponCodeById.get(discountId))
        .filter((code): code is string => Boolean(code) && sanitizedCouponCodes.includes(code as string));

      if (mappedCodes.length > 0) {
        productCouponMap[product.id] = mappedCodes;
      }
    }
  }

  return {
    coupons,
    productCouponMap,
    sanitizedCouponCodes,
    missingCouponCodes,
  };
};

export const resolveCouponsForCart = async (
  cart: CartItem[],
  couponCodes: string[] = [],
): Promise<{
  coupons: Coupon[];
  productCouponMap: Record<string, string[]>;
  sanitizedCouponCodes: string[];
  missingCouponCodes: string[];
  allocation: CouponAllocationResult;
}> => {
  const { coupons, productCouponMap, sanitizedCouponCodes, missingCouponCodes } = await fetchCouponsForCart(
    cart,
    couponCodes,
  );

  const allocation = allocateCouponsToItems(cart, coupons, sanitizedCouponCodes, productCouponMap);

  return {
    coupons,
    productCouponMap,
    sanitizedCouponCodes,
    missingCouponCodes,
    allocation,
  };
};

export const summarizeCouponsForItems = (
  items: CartItem[],
  perItemCoupons: Record<string, OrderItemCoupon | undefined>,
): AppliedCouponSummary => {
  const appliedCouponsMap: Record<string, AppliedCoupon> = {};
  let totalDiscount = 0;

  for (const item of items) {
    const coupon = perItemCoupons[item.id];
    if (!coupon) {
      continue;
    }

    totalDiscount += coupon.discountAmount;

    if (!appliedCouponsMap[coupon.code]) {
      appliedCouponsMap[coupon.code] = {
        code: coupon.code,
        discountAmount: 0,
        appliedProductIds: [],
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      };
    }

    appliedCouponsMap[coupon.code].discountAmount += coupon.discountAmount;
    appliedCouponsMap[coupon.code].appliedProductIds.push(item.id);
  }

  return {
    totalDiscount,
    coupons: Object.values(appliedCouponsMap),
  };
};

/**
 * Calculate discount amount for a product using provided coupon
 */
const calculateDiscountForCoupon = (item: CartItem, coupon: Coupon): number => {
  const baseAmount = item.sale_price * item.quantity;

  if (baseAmount <= 0) {
    return 0;
  }

  if (coupon.discountType === 'PERCENT') {
    const percent = Math.max(0, coupon.discountValue);
    return Math.min(baseAmount, (baseAmount * percent) / 100);
  }

  return Math.min(baseAmount, Math.max(0, coupon.discountValue));
};

/**
 * Determine best coupon application across items
 */
export const allocateCouponsToItems = (
  items: CartItem[],
  coupons: Coupon[],
  requestedCouponCodes: string[],
  productCouponMap: Record<string, string[]>,
): CouponAllocationResult => {
  const perItemCoupons: Record<string, OrderItemCoupon | undefined> = {};
  const appliedCouponsMap: Record<string, AppliedCoupon> = {};
  const appliedCodes = new Set<string>();

  const validCouponCodes = new Set(coupons.map((coupon) => coupon.code));
  const invalidCouponCodes = requestedCouponCodes.filter((code) => !validCouponCodes.has(code));

  for (const item of items) {
    const applicableCoupons = (productCouponMap[item.id] || [])
      .map((code) => coupons.find((coupon) => coupon.code === code))
      .filter((coupon): coupon is Coupon => Boolean(coupon));

    if (applicableCoupons.length === 0) {
      continue;
    }

    const bestCoupon = applicableCoupons.reduce<OrderItemCoupon | undefined>((best, coupon) => {
      const discount = calculateDiscountForCoupon(item, coupon);
      if (discount <= 0) {
        return best;
      }

      if (!best || discount > best.discountAmount) {
        return {
          code: coupon.code,
          discountAmount: discount,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        };
      }

      return best;
    }, undefined);

    if (!bestCoupon) {
      continue;
    }

    perItemCoupons[item.id] = bestCoupon;
    appliedCodes.add(bestCoupon.code);

    if (!appliedCouponsMap[bestCoupon.code]) {
      appliedCouponsMap[bestCoupon.code] = {
        code: bestCoupon.code,
        discountAmount: 0,
        appliedProductIds: [],
        discountType: bestCoupon.discountType,
        discountValue: bestCoupon.discountValue,
      };
    }

    appliedCouponsMap[bestCoupon.code].discountAmount += bestCoupon.discountAmount;
    appliedCouponsMap[bestCoupon.code].appliedProductIds.push(item.id);
  }

  const couponsArray = Object.values(appliedCouponsMap);
  const totalDiscount = couponsArray.reduce((sum, coupon) => sum + coupon.discountAmount, 0);

  const unappliedCouponCodes = requestedCouponCodes.filter(
    (code) => validCouponCodes.has(code) && !appliedCodes.has(code),
  );

  return {
    perItemCoupons,
    summary: {
      totalDiscount,
      coupons: couponsArray,
    },
    invalidCouponCodes,
    unappliedCouponCodes,
  };
};

/**
 * Calculate order total with coupon allocations
 */
export const calculateOrderTotal = (
  items: CartItem[],
  perItemCoupons: Record<string, OrderItemCoupon | undefined>,
): number => {
  return items.reduce((sum, item) => {
    const basePrice = item.quantity * item.sale_price;
    const discount = perItemCoupons[item.id]?.discountAmount || 0;
    return sum + Math.max(basePrice - discount, 0);
  }, 0);
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
      totalDiscount: orderData.totalDiscount,
      appliedCoupons: orderData.appliedCoupons ? (orderData.appliedCoupons as unknown as Prisma.InputJsonValue) : null,
      items: {
        create: orderData.items.map((item: OrderItemData) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          selectedOptions: item.selectedOptions,
          discountAmount: item.discountAmount ?? 0,
          coupon: item.coupon ? (item.coupon as unknown as Prisma.InputJsonValue) : null,
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
  const { cart, totalAmount, shippingAddressId, sessionId, userId, couponCodes = [] } = sessionData;

  const { allocation } = await resolveCouponsForCart(cart, couponCodes);
  const perItemCoupons = allocation.perItemCoupons;

  // Group cart items by shop
  const shopGrouped = groupCartByShop(cart);

  // Process each shop's orders
  for (const [shopId, items] of Object.entries(shopGrouped)) {
    // Calculate order total for this shop
    const shopPerItemCoupons: Record<string, OrderItemCoupon | undefined> = {};
    for (const item of items) {
      shopPerItemCoupons[item.id] = perItemCoupons[item.id];
    }

    const orderTotal = calculateOrderTotal(items, shopPerItemCoupons);

    const shopCoupons = summarizeCouponsForItems(items, shopPerItemCoupons);

    // Create order data
    const orderData: OrderData = {
      userId,
      shopId,
      total: orderTotal,
      status: 'PAID',
      shippingAddressId: shippingAddressId || undefined,
      totalDiscount: shopCoupons.totalDiscount,
      appliedCoupons: shopCoupons,
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.sale_price,
        selectedOptions: item.selectedOptions,
        discountAmount: perItemCoupons[item.id]?.discountAmount || 0,
        coupon: perItemCoupons[item.id]
          ? {
              code: perItemCoupons[item.id]!.code,
              discountAmount: perItemCoupons[item.id]!.discountAmount,
              discountType: perItemCoupons[item.id]!.discountType,
              discountValue: perItemCoupons[item.id]!.discountValue,
            }
          : null,
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
  const finalTotal = totalAmount - allocation.summary.totalDiscount;
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
