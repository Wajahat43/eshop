import Link from 'next/link';
import React from 'react';
import { twMerge } from 'tailwind-merge';

interface SidebarItemProps {
  icon: React.ReactNode;
  title: string;
  isActive: boolean;
  href: string;
}

const SidebarItem = ({ icon, title, isActive, href }: SidebarItemProps) => {
  return (
    <Link href={href} className="my-1 block w-full">
      <div
        className={twMerge(
          'flex w-full max-w-full gap-3 min-h-12 items-center px-3 rounded-lg cursor-pointer transition-all duration-200 ease-in-out group overflow-hidden',
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          'border border-transparent hover:border-sidebar-border',
          isActive
            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm border-sidebar-primary'
            : 'text-sidebar-foreground hover:shadow-sm',
        )}
      >
        <div
          className={twMerge(
            'flex items-center justify-center w-5 h-5 transition-colors duration-200 flex-shrink-0',
            isActive
              ? 'text-sidebar-primary-foreground'
              : 'text-sidebar-foreground group-hover:text-sidebar-accent-foreground',
          )}
        >
          {icon}
        </div>
        <h5
          className={twMerge(
            'text-sm font-medium transition-colors duration-200 truncate min-w-0',
            isActive
              ? 'text-sidebar-primary-foreground'
              : 'text-sidebar-foreground group-hover:text-sidebar-accent-foreground',
          )}
        >
          {title}
        </h5>
      </div>
    </Link>
  );
};

export default SidebarItem;
