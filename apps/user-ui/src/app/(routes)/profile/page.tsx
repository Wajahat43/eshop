'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useUser from '../../../hooks/userUser';
import { useUserOrders } from '../../../hooks/useUserOrders';
import { ProfileTabs, ProfileContent, ProfileStats } from '../../../shared/components/organisms/profile';
import { Spinner } from '../../../shared/components/spinner';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isPending, isError } = useUser();
  const { data: ordersData } = useUserOrders();

  // Get active tab from query params, default to 'profile'
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') || 'profile';
  });

  // Calculate real stats from user orders
  const orderStats = useMemo(() => {
    const orders = ordersData?.data || [];

    const totalOrders = orders.length;
    const processingOrders = orders.filter((order) =>
      ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED'].includes(order.status),
    ).length;
    const completedOrders = orders.filter((order) => order.status === 'DELIVERED').length;

    return {
      totalOrders,
      processingOrders,
      completedOrders,
    };
  }, [ordersData?.data]);

  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', activeTab);
    router.replace(`/profile?${params.toString()}`, { scroll: false });
  }, [activeTab, router, searchParams]);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Loading state
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Error state
  if (isError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Profile</h1>
          <p className="text-muted-foreground">Unable to load user profile. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user.name || user.email || 'User'}!
          </h1>
          <p className="text-muted-foreground">Manage your profile, orders, and preferences</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Order Overview</h2>
          <ProfileStats {...orderStats} />
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Left Sidebar - Navigation Tabs */}
          <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />

          {/* Right Content Area */}
          <ProfileContent activeTab={activeTab} user={user} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
