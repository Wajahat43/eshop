'use client';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

interface UseFilteredShopsProps {
  categories?: string;
  countries?: string;
  page?: number;
  limit?: number;
}

const useFilteredShops = ({ categories, countries, page, limit }: UseFilteredShopsProps) => {
  // Only run query if we have at least one filter or if it's the first page
  const shouldRunQuery = page === 1 || Boolean(categories) || Boolean(countries);

  const query = useQuery({
    queryKey: ['filtered-shops', categories, countries, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categories) params.append('categories', categories);
      if (countries) params.append('countries', countries);
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());

      const response = await axiosInstance.get(`/product/api/get-filtered-shops?${params.toString()}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: shouldRunQuery, // Only run when we should
  });

  return query;
};

export default useFilteredShops;
