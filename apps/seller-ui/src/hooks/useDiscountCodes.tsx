import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosIsntance';

// Types for discount codes
export interface DiscountCode {
  id: string;
  public_name: string;
  discountType: string;
  discountValue: number;
  discountCode: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscountCodeData {
  public_name: string;
  discountType: string;
  discountValue: number;
  discountCode: string;
}

export interface DiscountCodesResponse {
  message: string;
  discountCodes: DiscountCode[];
}

export interface CreateDiscountCodeResponse {
  message: string;
  discountCode: DiscountCode;
}

export interface DeleteDiscountCodeResponse {
  message: string;
}

// API functions
const fetchDiscountCodesAPI = async (): Promise<DiscountCodesResponse> => {
  const response = await axiosInstance.get<DiscountCodesResponse>('/product/api/get-discount-codes');
  return response.data;
};

const createDiscountCode = async (data: CreateDiscountCodeData): Promise<CreateDiscountCodeResponse> => {
  const response = await axiosInstance.post<CreateDiscountCodeResponse>('/product/api/create-discount-code', data);
  return response.data;
};

const deleteDiscountCode = async (id: string): Promise<DeleteDiscountCodeResponse> => {
  const response = await axiosInstance.delete<DeleteDiscountCodeResponse>(`/product/api/delete-discount-code/${id}`);
  return response.data;
};

// React Query keys
export const discountCodesKeys = {
  all: ['discountCodes'] as const,
  lists: () => [...discountCodesKeys.all, 'list'] as const,
  list: (filters: string) => [...discountCodesKeys.lists(), { filters }] as const,
  details: () => [...discountCodesKeys.all, 'detail'] as const,
  detail: (id: string) => [...discountCodesKeys.details(), id] as const,
};

// Hook for managing discount codes with React Query
export const useDiscountCodes = () => {
  const queryClient = useQueryClient();

  // Query for fetching discount codes
  const {
    data: discountCodesData,
    isLoading: loading,
    error,
    refetch: fetchDiscountCodes,
  } = useQuery({
    queryKey: discountCodesKeys.lists(),
    queryFn: fetchDiscountCodesAPI,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for creating discount codes
  const createDiscountCodeMutation = useMutation({
    mutationFn: createDiscountCode,
    onSuccess: (data) => {
      // Invalidate and refetch discount codes
      queryClient.invalidateQueries({ queryKey: discountCodesKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Failed to create discount code:', error);
    },
  });

  // Mutation for deleting discount codes
  const deleteDiscountCodeMutation = useMutation({
    mutationFn: deleteDiscountCode,
    onSuccess: (data, deletedId) => {
      // Invalidate and refetch discount codes
      queryClient.invalidateQueries({ queryKey: discountCodesKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Failed to delete discount code:', error);
    },
  });

  return {
    // Query values
    data: discountCodesData,
    isLoading: loading,
    error,
    refetch: fetchDiscountCodes,

    // Mutation values
    createDiscountCode: createDiscountCodeMutation,
    deleteDiscountCode: deleteDiscountCodeMutation,
  };
};
