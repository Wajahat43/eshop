'use client';
import { useMemo } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

interface UseShopsProps {
  page?: number;
  limit?: number;
}

const useShops = ({ page, limit }: UseShopsProps) => {
  const queryClient = useQueryClient();

  const getShopsQuery = useQuery({
    queryKey: ['all-shops', page, limit],
    queryFn: async ({ queryKey }) => {
      const [, page, limit] = queryKey;

      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      const response = await axiosInstance.get(`/product/api/get-filtered-shops?${params.toString()}`);
      console.log('Shops', response.data);
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return getShopsQuery;
};

export default useShops;
