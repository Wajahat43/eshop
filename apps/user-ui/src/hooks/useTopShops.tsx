'use client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

interface UseTopShopsProps {
  page?: number;
  limit?: number;
}

const useTopShops = ({ page, limit }: UseTopShopsProps) => {
  const getTopShopsQuery = useQuery({
    queryKey: ['top-shops', page, limit],
    queryFn: async ({ queryKey }) => {
      const [, page, limit] = queryKey;

      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      const response = await axiosInstance.get(`/product/api/top-shops?${params.toString()}`);
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return getTopShopsQuery;
};

export default useTopShops;
