import { keepPreviousData, useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosIsntance';

export const useEvents = (page = 1, limit = 12) => {
  return useQuery({
    queryKey: ['events', page, limit],
    queryFn: async () => {
      const response = await axiosInstance.get('/product/api/get-all-events', {
        params: { page, limit },
      });
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  });
};

export default useEvents;
