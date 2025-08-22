import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import axiosInstance from '../utils/axiosInstance';

interface PaymentSessionData {
  cart: any[];
  userId: string;
  selectedAddressId?: string;
  coupon?: string;
}

interface PaymentSessionResponse {
  sessionId: string;
}

const usePaymentSession = () => {
  const router = useRouter();

  const createPaymentSessionMutation = useMutation({
    mutationFn: async (data: PaymentSessionData): Promise<PaymentSessionResponse> => {
      const response = await axiosInstance.post('/order/api/create-payment-session', data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.sessionId) {
        // Redirect to checkout page with session ID
        router.push(`/checkout?sessionId=${data.sessionId}`);
      }
    },
    onError: (error) => {
      console.error('Error creating payment session:', error);
    },
  });

  return {
    createPaymentSession: createPaymentSessionMutation.mutate,
    isLoading: createPaymentSessionMutation.isPending,
    error: createPaymentSessionMutation.error,
    isSuccess: createPaymentSessionMutation.isSuccess,
  };
};

export default usePaymentSession;
