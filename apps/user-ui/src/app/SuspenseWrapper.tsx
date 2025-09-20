'use client';

import { Suspense } from 'react';

interface SuspenseWrapperProps {
  children: React.ReactNode;
}

const LoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold mb-2">Loading...</h2>
      <p className="text-muted-foreground">Please wait while we prepare your experience.</p>
    </div>
  </div>
);

export default function SuspenseWrapper({ children }: SuspenseWrapperProps) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}
