import React from 'react';

interface SidebarMenuProps {
  title: string;
  children: React.ReactNode;
}

const SidebarMenu = ({ title, children }: SidebarMenuProps) => {
  return (
    <div className="block space-y-2">
      <h3 className="text-xs font-semibold tracking-wider uppercase text-sidebar-foreground/70 pl-1 mb-2">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
};

export default SidebarMenu;
