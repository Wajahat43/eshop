import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

interface UserAddress {
  id: string;
  label: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateAddressData {
  label: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  isDefault?: boolean;
}

interface UpdateAddressData extends CreateAddressData {
  id: string;
}

// Fetch user addresses
const fetchUserAddresses = async (): Promise<UserAddress[]> => {
  const response = await axiosInstance.get('/api/user-addresses');
  return response.data.addresses;
};

// Add new address
const addAddress = async (data: CreateAddressData): Promise<UserAddress> => {
  const response = await axiosInstance.post('/api/user-addresses', data);
  return response.data.address;
};

// Update address
const updateAddress = async (data: UpdateAddressData): Promise<UserAddress> => {
  const response = await axiosInstance.put(`/api/user-addresses/${data.id}`, data);
  return response.data.address;
};

// Delete address
const deleteAddress = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/user-addresses/${id}`);
};

// Set default address
const setDefaultAddress = async (id: string): Promise<UserAddress> => {
  const response = await axiosInstance.patch(`/api/user-addresses/${id}/set-default`);
  return response.data.address;
};

export const useUserAddresses = () => {
  return useQuery({
    queryKey: ['user-addresses'],
    queryFn: fetchUserAddresses,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAddAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
    },
  });
};

export type { UserAddress, CreateAddressData, UpdateAddressData };
