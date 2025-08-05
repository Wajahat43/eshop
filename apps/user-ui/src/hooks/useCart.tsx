'use client';

import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  addedAt: string;
}

interface CartResponse {
  items: CartItem[];
  totalCount: number;
  totalPrice: number;
}

const fetchCart = async (): Promise<CartResponse> => {
  try {
    const response = await axiosInstance.get('/api/cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return { items: [], totalCount: 0, totalPrice: 0 };
  }
};

const useCart = () => {
  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: true, // Always enabled to show count
  });

  return {
    cartItems: cartQuery.data?.items || [],
    cartCount: cartQuery.data?.totalCount || 0,
    cartTotal: cartQuery.data?.totalPrice || 0,
    isLoading: cartQuery.isLoading,
    isError: cartQuery.isError,
    refetch: cartQuery.refetch,
  };
};

export default useCart;
