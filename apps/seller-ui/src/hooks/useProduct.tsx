import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosIsntance';
import { toast } from 'react-hot-toast';

const useProduct = () => {
  const queryClient = useQueryClient();

  const getShopProductsQuery = useQuery({
    queryKey: ['shop-products'],
    queryFn: async () => {
      const response = await axiosInstance.get('/product/api/get-shop-products');
      return response.data?.products;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const createProductMutation = useMutation({
    mutationFn: async (product: any) => {
      const response = await axiosInstance.post('/product/api/create-product', product);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Product created successfully');
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
    },
    onError: () => {
      toast.error('Failed to create product');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/product/api/delete-product/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
    },
    onError: () => {
      toast.error('Failed to delete product');
    },
  });

  const restoreProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.put(`/product/api/restore-product/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Product restored successfully');
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
    },
    onError: () => {
      toast.error('Failed to restore product');
    },
  });

  return useMemo(
    () => ({
      createProductMutation,
      productsQuery: getShopProductsQuery,
      deleteProductMutation,
      restoreProductMutation,
    }),
    [createProductMutation, getShopProductsQuery, deleteProductMutation, restoreProductMutation],
  );
};

export default useProduct;
