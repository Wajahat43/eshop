import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosIsntance';
import toast from 'react-hot-toast';

export interface Shop {
  id: string;
  name: string;
  bio: string;
  category: string;
  address: string;
  opening_hours: string;
  website?: string;
  social_links: any[];
  ratings: number;
  coverBanner?: string;
  avatar?: {
    id: string;
    url: string;
  };
  productAnalytics?: {
    views: number;
    cartAdds: number;
    purchases: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateShopInfoData {
  name: string;
  bio: string;
  address: string;
  opening_hours: string;
  website?: string;
  category: string;
  social_links?: any[];
}

export interface UpdateCoverBannerData {
  coverBanner: string;
}

// Get shop information
export const useShopInfo = () => {
  return useQuery({
    queryKey: ['shop-info'],
    queryFn: async (): Promise<Shop> => {
      const response = await axiosInstance.get('/api/shop-info');
      return response.data.shop;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Update shop information
export const useUpdateShopInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateShopInfoData): Promise<Shop> => {
      const response = await axiosInstance.put('/api/shop-info', data);
      return response.data.shop;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['shop-info'], data);
      toast.success('Shop information updated successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update shop information';
      toast.error(message);
    },
  });
};

// Update shop cover banner
export const useUpdateCoverBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCoverBannerData): Promise<Shop> => {
      const response = await axiosInstance.put('/api/shop-cover-banner', data);
      return response.data.shop;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['shop-info'], data);
      toast.success('Cover banner updated successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update cover banner';
      toast.error(message);
    },
  });
};
