import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

export interface UserOrderDetailItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  discountAmount?: number;
  coupon?: {
    code: string;
    discountAmount: number;
    discountType?: 'PERCENT' | 'FLAT' | string;
    discountValue?: number;
  } | null;
  selectedOptions?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    title: string;
    images: { id: string; url: string }[];
  };
}

export interface UserOrderDetailOrder {
  id: string;
  userId: string;
  shopId: string;
  total: number;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  shippingAddressId?: string;
  // Legacy
  couponCode?: string;
  discountAmount?: number;
  // New summary
  totalDiscount?: number;
  appliedCoupons?: {
    totalDiscount: number;
    coupons: Array<{
      code: string;
      discountAmount: number;
      appliedProductIds: string[];
      discountType?: 'PERCENT' | 'FLAT' | string;
      discountValue?: number;
    }>;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserOrderDetailAddress {
  id: string;
  userId: string;
  label: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface UserOrderDetailsResponse {
  success: boolean;
  data: {
    order: UserOrderDetailOrder;
    items: UserOrderDetailItem[];
    shippingAddress: UserOrderDetailAddress | null;
    coupon?: any | null;
  };
}

const fetchUserOrderDetails = async (orderId: string): Promise<UserOrderDetailsResponse> => {
  const response = await axiosInstance.get<UserOrderDetailsResponse>(`/order/api/get-order-details/${orderId}`);
  return response.data;
};

export const userOrderDetailsKeys = {
  detail: (id: string) => ['user-order-detail', id] as const,
};

export const useUserOrderDetails = (orderId: string) => {
  return useQuery({
    queryKey: userOrderDetailsKeys.detail(orderId),
    queryFn: () => fetchUserOrderDetails(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
