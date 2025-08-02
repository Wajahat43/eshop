import SidebarWrapper from 'apps/seller-ui/src/shared/components/sidebar/sidebar-wrapper';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}
const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex h-ful bg-background min-h-screen">
      {/**Sidebar */}
      <aside className="w-[280px] min-w-[250px] max-w-[300px] border-r border-border">
        <div className="div sticky top-0">
          <SidebarWrapper></SidebarWrapper>
        </div>
      </aside>

      {children}
    </div>
  );
};

export default Layout;
