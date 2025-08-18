'use client';
import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

interface UseOffersProps {
  page?: number;
  limit?: number;
}

const useOffers = ({ page, limit }: UseOffersProps) => {
  const getOffersQuery = useQuery({
    queryKey: ['all-offers', page, limit],
    queryFn: async ({ queryKey }) => {
      const [, page, limit] = queryKey;

      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());

      // Call the get-filtered-events endpoint to get offers
      const response = await axiosInstance.get(`/product/api/get-filtered-events?${params.toString()}`);
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return useMemo(
    () => ({
      getOffersQuery,
    }),
    [getOffersQuery],
  );
};

export default useOffers;
