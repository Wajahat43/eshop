'use client';

import React, { useEffect } from 'react';
import useSidebar from '../../../hooks/useSidebar';
import { usePathname } from 'next/navigation';
import useSeller from '../../../hooks/useSeller';
import Box from '../box';
import { Sidebar } from './sidebar-styles';
import Link from 'next/link';
import {
  BellRing,
  Calendar,
  Home,
  Inbox,
  ListOrdered,
  LogOut,
  LucideOctagon,
  PackageSearch,
  Percent,
  Settings,
  SquarePlus,
} from 'lucide-react';
import SidebarItem from './sidebar-item';
import SidebarMenu from './sidebar-menu';

const SidebarWrapper = () => {
  const pathname = usePathname();
  const { activeSideBar, setActiveSidebar } = useSidebar();
  const { seller } = useSeller();

  useEffect(() => {
    setActiveSidebar(pathname);
  }, [pathname, setActiveSidebar]);

  return (
    <Box
      css={{
        width: '100%',
        maxWidth: '16rem',
        zIndex: 202,
        position: 'sticky',
        padding: '8px',
        top: '0',
        overflowY: 'scroll',
        overflowX: 'hidden',
        scrollbarWidth: 'none',
      }}
      className="sidebar-wrapper"
    >
      <Sidebar.Header>
        <Box>
          <Link href="/" className="flex justify-center text-center gap-3 group">
            <div className="p-2 rounded-lg bg-sidebar-primary/10 group-hover:bg-sidebar-primary/20 transition-colors duration-200">
              <LucideOctagon className="w-6 h-6 text-sidebar-primary" />
            </div>
            <Box>
              <h3 className="text-lg font-semibold text-sidebar-foreground group-hover:text-sidebar-primary transition-colors duration-200">
                {seller?.shop?.name || 'My Shop'}
              </h3>
              <h5 className="font-medium text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px] text-sidebar-foreground/70">
                {seller?.shop?.Address || 'Shop Address'}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>

      <div className="block my-4 h-full">
        <Sidebar.Body className="body sidebar">
          <SidebarItem title="Dashboard" icon={<Home />} isActive={activeSideBar === '/'} href="/" />

          <div className="mt-6 space-y-6">
            <SidebarMenu title="Main Menu">
              <SidebarItem
                title="Orders"
                icon={<ListOrdered />}
                isActive={activeSideBar === '/dashboard/orders'}
                href="/dashboard/orders"
              />
              {/* <SidebarItem
                title="Payments"
                icon={<DollarSign />}
                isActive={activeSideBar === '/dashboard/payments'}
                href="/dashboard/payments"
              /> */}
            </SidebarMenu>

            <SidebarMenu title="Products">
              <SidebarItem
                title="Create Product"
                icon={<SquarePlus />}
                isActive={activeSideBar === '/dashboard/create-product'}
                href="/dashboard/create-product"
              />
              <SidebarItem
                title="All Products"
                icon={<PackageSearch />}
                isActive={activeSideBar === '/dashboard/all-products'}
                href="/dashboard/all-products"
              />
            </SidebarMenu>

            <SidebarMenu title="Events">
              <SidebarItem
                title="Create Event"
                icon={<SquarePlus />}
                isActive={activeSideBar === '/dashboard/create-event'}
                href="/dashboard/create-event"
              />
              <SidebarItem
                title="All Events"
                icon={<Calendar />}
                isActive={activeSideBar === '/dashboard/all-events'}
                href="/dashboard/all-events"
              />
            </SidebarMenu>

            <SidebarMenu title="Controllers">
              <SidebarItem
                title="Inbox"
                icon={<Inbox />}
                isActive={activeSideBar === '/dashboard/inbox'}
                href="/dashboard/inbox"
              />
              <SidebarItem
                title="Settings"
                icon={<Settings />}
                isActive={activeSideBar === '/dashboard/settings'}
                href="/dashboard/settings"
              />
              <SidebarItem
                title="Notifications"
                icon={<BellRing />}
                isActive={activeSideBar === '/dashboard/notifications'}
                href="/dashboard/notifications"
              />
            </SidebarMenu>

            <SidebarMenu title="Extras">
              <SidebarItem
                title="Discount Codes"
                icon={<Percent />}
                isActive={activeSideBar === '/dashboard/discount-codes'}
                href="/dashboard/discount-codes"
              />
              <SidebarItem
                title="Logout"
                icon={<LogOut />}
                isActive={activeSideBar === '/dashboard/logout'}
                href="/dashboard/logout"
              />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
};

export default SidebarWrapper;
