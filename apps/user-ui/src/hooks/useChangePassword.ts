import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-hot-toast';

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

const useChangePassword = () => {
  const queryClient = useQueryClient();

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const response = await axiosInstance.put('/api/change-password', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password changed successfully!');
      // Optionally invalidate user data to refresh any cached user info
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to change password';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      console.error('Password change error:', error);
    },
  });

  return {
    changePasswordMutation,
    changePassword: changePasswordMutation.mutate,
    isLoading: changePasswordMutation.isPending,
    isError: changePasswordMutation.isError,
    isSuccess: changePasswordMutation.isSuccess,
    error: changePasswordMutation.error,
  };
};

export default useChangePassword;
