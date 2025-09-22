'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import useUser from '../../../hooks/userUser';
import { runRedirectToLogin } from '../../../utils/redirect';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const DefaultFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      <p className="text-sm text-muted-foreground">Checking your account...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children, fallback }: ProtectedRouteProps) => {
  const { user, isLoading, isError } = useUser();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasRedirected = useRef(false);

  const search = searchParams?.toString();
  const redirectPath = pathname ? (search ? `${pathname}?${search}` : pathname) : undefined;

  useEffect(() => {
    if (!isLoading && (!user || isError) && !hasRedirected.current) {
      hasRedirected.current = true;
      runRedirectToLogin(redirectPath);
    }
  }, [isLoading, isError, user, redirectPath]);

  if (isLoading || (!user && !hasRedirected.current)) {
    return fallback ?? <DefaultFallback />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
