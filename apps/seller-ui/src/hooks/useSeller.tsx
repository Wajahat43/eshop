import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosIsntance';
import { usePathname } from 'next/navigation';

//Fetch user data from API
const fetchSeller = async () => {
  const response = await axiosInstance.get('/api/logged-in-seller');
  if (!response.data?.user) {
    return null;
  }
  return response.data.user;
};

const useSeller = () => {
  const pathname = usePathname();
  const userQuery = useQuery({
    queryKey: ['seller'],
    queryFn: fetchSeller,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: pathname !== '/login',
  });

  return {
    seller: userQuery.data,
    isPending: userQuery.isPending,
    isError: userQuery.isError,
    refetch: userQuery.refetch,
    isLoading: userQuery.isLoading,
  };
};

export default useSeller;
