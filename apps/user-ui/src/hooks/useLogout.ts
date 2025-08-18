import { useRouter } from 'next/navigation';
import axiosInstance from '../utils/axiosInstance';

const useLogout = () => {
  const router = useRouter();

  const logout = async () => {
    try {
      // Call backend logout endpoint to clear cookies
      await axiosInstance.post('/api/logout');

      // Clear any session storage if needed
      sessionStorage.clear();

      // Redirect to login page
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to login page
      // Backend will handle clearing cookies
      router.push('/login');
      router.refresh();
    }
  };

  return { logout };
};

export default useLogout;
