import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosIsntance';

// Types for orders
export interface OrderItem {
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
    images: {
      id: string;
      url: string;
    }[];
  };
}

export interface Order {
  id: string;
  userId: string;
  shopId: string;
  total: number;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  shippingAddressId?: string;
  // Legacy single-coupon fields may exist on old data
  couponCode?: string;
  discountAmount?: number;
  // New multi-coupon summary
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
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  items: OrderItem[];
}

export interface ShippingAddress {
  id: string;
  userId: string;
  label: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetailsData {
  order: Order;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  coupon: any | null;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  total: number;
}

export interface OrderDetailsResponse {
  success: boolean;
  data: OrderDetailsData;
}

// Types for order status update
export interface UpdateOrderStatusRequest {
  status: Order['status'];
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface UpdateOrderStatusResponse {
  success: boolean;
  message: string;
  data: Order;
}

// API functions
const fetchSellerOrders = async (): Promise<OrdersResponse> => {
  const response = await axiosInstance.get<OrdersResponse>('/order/api/get-seller-orders');
  return response.data;
};

const fetchOrderDetails = async (orderId: string): Promise<OrderDetailsResponse> => {
  const response = await axiosInstance.get<OrderDetailsResponse>(`/order/api/get-order-details/${orderId}`);
  return response.data;
};

const updateOrderStatus = async ({
  orderId,
  data,
}: {
  orderId: string;
  data: UpdateOrderStatusRequest;
}): Promise<UpdateOrderStatusResponse> => {
  const response = await axiosInstance.patch<UpdateOrderStatusResponse>(
    `/order/api/update-order-status/${orderId}`,
    data,
  );
  return response.data;
};

// React Query keys
export const ordersKeys = {
  all: ['orders'] as const,
  lists: () => [...ordersKeys.all, 'list'] as const,
  list: (filters: string) => [...ordersKeys.lists(), { filters }] as const,
  details: () => [...ordersKeys.all, 'detail'] as const,
  detail: (id: string) => [...ordersKeys.details(), id] as const,
};

// Hook for managing orders with React Query - returns full query object
export const useOrders = () => {
  return useQuery({
    queryKey: ordersKeys.lists(),
    queryFn: fetchSellerOrders,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for fetching individual order details
export const useOrderDetails = (orderId: string) => {
  return useQuery({
    queryKey: ordersKeys.detail(orderId),
    queryFn: () => fetchOrderDetails(orderId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!orderId, // Only run query if orderId exists
  });
};

// Hook for updating order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: (data, variables) => {
      // Invalidate and refetch orders list
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });

      // Update the specific order details
      queryClient.invalidateQueries({ queryKey: ordersKeys.detail(variables.orderId) });

      // Optimistically update the order details cache
      queryClient.setQueryData(ordersKeys.detail(variables.orderId), (oldData: OrderDetailsResponse | undefined) => {
        if (oldData) {
          return {
            ...oldData,
            data: {
              ...oldData.data,
              order: {
                ...oldData.data.order,
                status: variables.data.status,
                trackingNumber: variables.data.trackingNumber,
                estimatedDelivery: variables.data.estimatedDelivery,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }
        return oldData;
      });
    },
    onError: (error) => {
      console.error('Error updating order status:', error);
    },
  });
};
