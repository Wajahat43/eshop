import { Request, Response, NextFunction } from 'express';
import { CartItem, Coupon } from '../types';

export interface ValidatedRequest extends Request {
  body: {
    cart?: CartItem[];
    userId?: string;
    selectedAddressId?: string;
    coupon?: Coupon;
    amount?: number;
    stripeSellerAccountId?: string;
    sessionId?: string;
  };
}

export const validateCreatePaymentSession = (req: Request, res: Response, next: NextFunction) => {
  const { cart, userId } = req.body;

  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart must be a non-empty array',
    });
  }

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Valid userId is required',
    });
  }

  // Validate cart items
  for (const item of cart) {
    if (!item.id || !item.shopId || !item.quantity || !item.sale_price) {
      return res.status(400).json({
        success: false,
        message: 'Each cart item must have id, shopId, quantity, and sale_price',
      });
    }

    if (item.quantity <= 0 || item.sale_price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be positive and price must be non-negative',
      });
    }
  }

  next();
};

export const validateCreatePaymentIntent = (req: Request, res: Response, next: NextFunction) => {
  const { amount, stripeSellerAccountId, sessionId } = req.body;

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid amount is required',
    });
  }

  if (!stripeSellerAccountId || typeof stripeSellerAccountId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Valid stripeSellerAccountId is required',
    });
  }

  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Valid sessionId is required',
    });
  }

  next();
};
