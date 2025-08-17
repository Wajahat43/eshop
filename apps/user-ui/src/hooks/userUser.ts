import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import { usePathname } from 'next/navigation';

//Fetch user data from API
const fetchUser = async () => {
  const response = await axiosInstance.get('/api/logged-in-user');
  return response.data.user;
};

const useUser = () => {
  const pathname = usePathname();
  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: pathname !== '/login',
  });

  return {
    user: userQuery.data ,
    isPending: userQuery.isPending,
    isError: userQuery.isError,
    refetch: userQuery.refetch,
    isLoading: userQuery.isLoading,
  };
};

export default useUser;
