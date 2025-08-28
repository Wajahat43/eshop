'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

interface UnreadBadgeProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
}

const UnreadBadge: React.FC<UnreadBadgeProps> = ({ count, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-xs',
    lg: 'w-7 h-7 text-sm',
  };

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <div
      className={twMerge(
        'flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold',
        'animate-pulse transition-all duration-200 hover:scale-110',
        sizeClasses[size],
      )}
    >
      {displayCount}
    </div>
  );
};

export default UnreadBadge;
