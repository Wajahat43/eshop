import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

interface PaymentSessionData {
  cart: any[];
  userId: string;
  selectedAddressId?: string;
  couponCodes?: string[];
}

interface PaymentSessionResponse {
  sessionId: string;
  appliedCoupons?: any;
  perItemCoupons?: Record<string, any>;
  invalidCouponCodes?: string[];
  unappliedCouponCodes?: string[];
}

const usePaymentSession = () => {
  const router = useRouter();
  const [couponState, setCouponState] = useState<{
    codes: string[];
    appliedCoupons?: any;
    perItemCoupons?: Record<string, any>;
    invalidCouponCodes?: string[];
    unappliedCouponCodes?: string[];
  }>({ codes: [] });

  const createPaymentSessionMutation = useMutation({
    mutationFn: async (data: PaymentSessionData): Promise<PaymentSessionResponse> => {
      const response = await axiosInstance.post('/order/api/create-payment-session', data);
      return response.data;
    },
    onSuccess: (data) => {
      setCouponState((prev) => ({
        codes: prev.codes,
        appliedCoupons: data.appliedCoupons,
        perItemCoupons: data.perItemCoupons,
        invalidCouponCodes: data.invalidCouponCodes,
        unappliedCouponCodes: data.unappliedCouponCodes,
      }));
      if (data.sessionId) {
        router.push(`/checkout?sessionId=${data.sessionId}`);
      }
    },
    onError: (error) => {
      console.error('Error creating payment session:', error);
    },
  });

  const previewCoupons = useCallback(async (cart: any[], couponCodes: string[]) => {
    if (!cart.length) {
      setCouponState({ codes: [], appliedCoupons: undefined, perItemCoupons: undefined });
      return {
        appliedCoupons: undefined,
        perItemCoupons: undefined,
        invalidCouponCodes: [],
        unappliedCouponCodes: [],
      };
    }

    try {
      const response = await axiosInstance.post('/order/api/preview-coupons', {
        cart,
        couponCodes,
      });

      setCouponState({
        codes: couponCodes,
        appliedCoupons: response.data.appliedCoupons,
        perItemCoupons: response.data.perItemCoupons,
        invalidCouponCodes: response.data.invalidCouponCodes,
        unappliedCouponCodes: response.data.unappliedCouponCodes,
      });

      return response.data;
    } catch (error) {
      console.error('Error previewing coupons:', error);
      setCouponState({ codes: couponCodes });
      throw error;
    }
  }, []);

  const resetCouponState = useCallback(() => {
    setCouponState((prev) => {
      const isAlreadyReset =
        (prev.codes?.length ?? 0) === 0 &&
        prev.appliedCoupons === undefined &&
        prev.perItemCoupons === undefined &&
        prev.invalidCouponCodes === undefined &&
        prev.unappliedCouponCodes === undefined;

      if (isAlreadyReset) return prev;

      return {
        codes: [],
        appliedCoupons: undefined,
        perItemCoupons: undefined,
        invalidCouponCodes: undefined,
        unappliedCouponCodes: undefined,
      };
    });
  }, []);

  return {
    createPaymentSession: createPaymentSessionMutation.mutate,
    isLoading: createPaymentSessionMutation.isPending,
    error: createPaymentSessionMutation.error,
    isSuccess: createPaymentSessionMutation.isSuccess,
    appliedCoupons: couponState.appliedCoupons,
    perItemCoupons: couponState.perItemCoupons,
    invalidCouponCodes: couponState.invalidCouponCodes,
    unappliedCouponCodes: couponState.unappliedCouponCodes,
    couponCodes: couponState.codes,
    updateCouponState: previewCoupons,
    resetCouponState,
  };
};

export default usePaymentSession;
