'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

interface UseEventsProps {
  page?: number;
  limit?: number;
}

const useEvents = ({ page, limit }: UseEventsProps) => {
  const getEventsQuery = useQuery({
    queryKey: ['all-events', page, limit],
    queryFn: async ({ queryKey }) => {
      const [, page, limit] = queryKey;

      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      const response = await axiosInstance.get(`/product/api/get-all-events?${params.toString()}`);
      console.log('Events', response.data);
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return getEventsQuery;
};

export default useEvents;
