export interface CartItem {
  id: string;
  title: string;
  shopId: string;
  quantity: number;
  sale_price: number;
  selectedOptions?: Record<string, any>;
}

export type CouponDiscountType = 'PERCENT' | 'FLAT';

export interface Coupon {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
}

export interface AppliedCoupon {
  code: string;
  discountAmount: number;
  appliedProductIds: string[];
  discountType: CouponDiscountType;
  discountValue: number;
}

export interface AppliedCouponSummary {
  totalDiscount: number;
  coupons: AppliedCoupon[];
}

export interface OrderItemCoupon {
  code: string;
  discountAmount: number;
  discountType: CouponDiscountType;
  discountValue: number;
}

export interface CouponAllocationResult {
  perItemCoupons: Record<string, OrderItemCoupon | undefined>;
  summary: AppliedCouponSummary;
  invalidCouponCodes: string[];
  unappliedCouponCodes: string[];
}

export interface SellerData {
  shopId: string;
  sellerId: string;
  stripeAccountId?: string;
}

export interface PaymentSession {
  userId: string;
  sessionId: string;
  cart: CartItem[];
  sellers: SellerData[];
  totalAmount: number;
  shippingAddressId?: string;
  couponCodes?: string[];
  perItemCoupons?: Record<string, OrderItemCoupon | undefined>;
  appliedCoupons?: AppliedCouponSummary;
  invalidCouponCodes?: string[];
  unappliedCouponCodes?: string[];
  subtotal?: number;
}

export interface OrderItemData {
  productId: string;
  quantity: number;
  price: number;
  selectedOptions?: Record<string, any>;
  discountAmount?: number;
  coupon?: OrderItemCoupon | null;
}

export interface OrderData {
  userId: string;
  shopId: string;
  total: number;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  shippingAddressId?: string;
  totalDiscount: number;
  appliedCoupons?: AppliedCouponSummary;
  items: OrderItemData[];
}

export interface UserAction {
  productId: string;
  shopId: string;
  action: string;
  timeStamp: number;
}

export interface NotificationData {
  title: string;
  message: string;
  creatorId: string;
  receiverId: string;
  redirect_link?: string;
}

export interface StripeWebhookEvent {
  type: string;
  data: {
    object: {
      metadata: {
        sessionId: string;
        userId: string;
      };
    };
  };
}
