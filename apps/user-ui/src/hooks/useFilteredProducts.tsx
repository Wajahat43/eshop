'use client';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

interface FilterParams {
  priceRange: string;
  categories: string;
  colors: string;
  sizes: string;
  page: number;
  limit: number;
}

const useFilteredProducts = (filters: FilterParams) => {
  const { priceRange, categories, colors, sizes, page, limit } = filters;

  // Only run query if we have at least one filter or if it's the first page
  const shouldRunQuery =
    page === 1 || Boolean(categories) || Boolean(colors) || Boolean(sizes) || priceRange !== '0-100000';

  const query = useQuery({
    queryKey: ['filtered-products', priceRange, categories, colors, sizes, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('priceRange', priceRange);
      params.append('categories', categories);
      params.append('colors', colors);
      params.append('sizes', sizes);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await axiosInstance.get(`/product/api/get-filtered-products?${params.toString()}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: shouldRunQuery, // Only run when we should
  });

  return query;
};

export default useFilteredProducts;
