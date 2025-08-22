import { useQuery, useMutation } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

interface SessionData {
  sessionId: string;
  cart: any[];
  totalAmount: number;
  shippingAddressId?: string;
  coupon?: any;
  sellers: any[];
}

interface PaymentIntentData {
  amount: number;
  stripeSellerAccountId: string;
  sessionId: string;
}

interface PaymentIntentResponse {
  success: boolean;
  clientSecret: string;
  paymentIntentId: string;
}

const useCheckout = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const sessionId = searchParams.get('sessionId');

  // Query to verify payment session
  const {
    data: sessionData,
    isLoading: isSessionLoading,
    error: sessionError,
  } = useQuery({
    queryKey: ['payment-session', sessionId],
    queryFn: async (): Promise<SessionData> => {
      if (!sessionId) {
        throw new Error('No session ID provided');
      }

      const response = await axiosInstance.get(`/order/api/verify-session/${sessionId}`);
      return response.data.session;
    },
    enabled: !!sessionId,
  });

  // Mutation to create payment intent
  const createPaymentIntentMutation = useMutation({
    mutationFn: async (data: PaymentIntentData): Promise<PaymentIntentResponse> => {
      const response = await axiosInstance.post('/order/api/create-payment-intent', data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      }
    },
    onError: (error) => {
      console.error('Error creating payment intent:', error);
    },
  });

  // Function to create payment intent for a specific seller
  const createPaymentIntent = async (sellerData: any) => {
    if (!sessionData) {
      throw new Error('No session data available');
    }

    const cartItemsForSeller = sessionData.cart.filter((item: any) => item.shopId === sellerData.shopId);

    const totalForSeller = cartItemsForSeller.reduce(
      (sum: number, item: any) => sum + item.sale_price * item.quantity,
      0,
    );

    const result = await createPaymentIntentMutation.mutateAsync({
      amount: totalForSeller,
      stripeSellerAccountId: sellerData.stripeAccountId,
      sessionId: sessionData.sessionId,
    });

    return result;
  };

  return {
    // Session data
    sessionId,
    sessionData,
    isSessionLoading,
    sessionError,

    // Payment intent
    clientSecret,
    createPaymentIntent,
    isCreatingPaymentIntent: createPaymentIntentMutation.isPending,
    paymentIntentError: createPaymentIntentMutation.error,

    // Cart items
    cartItems: sessionData?.cart || [],

    // Coupon
    coupon: sessionData?.coupon,

    // Loading states
    loading: isSessionLoading || createPaymentIntentMutation.isPending,

    // Error handling
    error: sessionError,
  };
};

export default useCheckout;
