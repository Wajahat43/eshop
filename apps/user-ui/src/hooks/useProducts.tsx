'use client';
import { useMemo } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

interface UseProductProps {
  page?: number;
  limit?: number;
  type?: string;
}

const useProducts = ({ page, limit, type }: UseProductProps) => {
  const queryClient = useQueryClient();

  const getProductsQuery = useQuery({
    queryKey: ['all-products', page, limit, type],
    queryFn: async ({ queryKey }) => {
      const [, page, limit, type] = queryKey;

      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      if (type) params.append('type', type as string);
      const response = await axiosInstance.get(`/product/api/get-all-products?${params.toString()}`);
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const getCategoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axiosInstance.get('/product/api/get-categories');
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const getFilteredProductsQuery = useQuery({
    queryKey: ['filtered-products', page, limit, type],
    queryFn: async ({ queryKey }) => {
      const [, page, limit, type] = queryKey;

      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      if (type) params.append('type', type as string);
      const response = await axiosInstance.get(`/product/api/get-filtered-products?${params.toString()}`);
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: false, // Don't run automatically, only when manually triggered
  });

  return useMemo(
    () => ({
      getProductsQuery,
      getCategoriesQuery,
      getFilteredProductsQuery,
    }),
    [getProductsQuery, getCategoriesQuery, getFilteredProductsQuery],
  );
};

export default useProducts;
