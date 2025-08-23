import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

// Types for user orders
export interface UserOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  selectedOptions?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    title: string;
    images: {
      id: string;
      url: string;
    }[];
  };
}

export interface UserOrder {
  id: string;
  userId: string;
  shopId: string;
  total: number;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  shippingAddressId?: string;
  couponCode?: string;
  discountAmount: number;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
  shop: {
    id: string;
    name: string;
    avatar?: {
      url: string;
    } | null;
  };
  items: UserOrderItem[];
}

export interface UserOrdersResponse {
  success: boolean;
  data: UserOrder[];
  total: number;
}

// API functions
const fetchUserOrders = async (): Promise<UserOrdersResponse> => {
  const response = await axiosInstance.get<UserOrdersResponse>('/order/api/get-user-orders');
  return response.data;
};

// React Query keys
export const userOrdersKeys = {
  all: ['userOrders'] as const,
  lists: () => [...userOrdersKeys.all, 'list'] as const,
  list: (filters: string) => [...userOrdersKeys.lists(), { filters }] as const,
};

// Hook for managing user orders with React Query
export const useUserOrders = () => {
  return useQuery({
    queryKey: userOrdersKeys.lists(),
    queryFn: fetchUserOrders,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
