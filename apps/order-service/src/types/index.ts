export interface CartItem {
  id: string;
  title: string;
  shopId: string;
  quantity: number;
  sale_price: number;
  selectedOptions?: Record<string, any>;
}

export interface Coupon {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  discountedProductId?: string;
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
  coupon?: Coupon;
}

export interface OrderItemData {
  productId: string;
  quantity: number;
  price: number;
  selectedOptions?: Record<string, any>;
}

export interface OrderData {
  userId: string;
  shopId: string;
  total: number;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  shippingAddressId?: string;
  couponCode?: string;
  discountAmount: number;
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
