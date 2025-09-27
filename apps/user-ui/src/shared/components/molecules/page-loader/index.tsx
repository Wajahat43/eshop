'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
  className?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ message = 'Loading...', className = '' }) => {
  return (
    <div className={`flex min-h-[60vh] w-full items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-3" role="status">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="text-sm font-medium text-muted-foreground">{message}</span>
      </div>
    </div>
  );
};

export default PageLoader;
