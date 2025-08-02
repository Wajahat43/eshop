//Create hook to fetch product categories using react query

import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosIsntance';

const useProductCategories = () => {
  return useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const response = await axiosInstance.get('/product/api/get-categories');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, //5 minutes
    retry: 2,
  });
};

export default useProductCategories;
