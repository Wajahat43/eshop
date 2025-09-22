'use client';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WebSocketProvider } from '../context/websocket-context';
import useUser from '../hooks/userUser';
import { useRouter } from 'next/navigation';
import { setRedirectHandler } from '../utils/redirect';

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ProvidersWithWebSocket>{children}</ProvidersWithWebSocket>
    </QueryClientProvider>
  );
};

// Main providers component that sets up everything in the correct order
const ProvidersWithWebSocket = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    setRedirectHandler((redirectPath) => {
      if (typeof window === 'undefined') {
        return;
      }

      const fallbackPath = `${window.location.pathname}${window.location.search}`;
      const target = redirectPath ?? fallbackPath;
      const isLoginPath = target.startsWith('/login');

      const params = new URLSearchParams();
      if (!isLoginPath && target) {
        params.set('redirect', target);
      }

      const loginUrl = params.toString() ? `/login?${params.toString()}` : '/login';
      router.replace(loginUrl);
    });
  }, [router]);

  return (
    <>
      {user && <WebSocketProvider user={user}>{children}</WebSocketProvider>}
      {!user && children}
    </>
  );
};

export default Providers;
