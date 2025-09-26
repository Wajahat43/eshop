'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useUser from '../../../hooks/userUser';
import { useUserOrders } from '../../../hooks/useUserOrders';
import {
  ProfileTabs,
  ProfileContent as ProfileContentSection,
  ProfileStats,
} from '../../../shared/components/organisms/profile';
import { Spinner } from '../../../shared/components/spinner';
import ProtectedRoute from '../../../shared/components/guards/protected-route';

const ProfilePage: React.FC = () => {
  return (
    <ProtectedRoute fallback={<ProfileLoadingFallback />}>
      <ProfileScreen />
    </ProtectedRoute>
  );
};

const ProfileLoadingFallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <Spinner />
  </div>
);

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isPending, isError } = useUser();
  const { data: ordersData } = useUserOrders();

  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'profile');

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

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', activeTab);
    router.replace(`/profile?${params.toString()}`, { scroll: false });
  }, [activeTab, router, searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-destructive">Error Loading Profile</h1>
          <p className="text-muted-foreground">Unable to load user profile. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            Welcome back, {user.name || user.email || 'User'}!
          </h1>
          <p className="text-muted-foreground">Manage your profile, orders, and preferences</p>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Order Overview</h2>
          <ProfileStats {...orderStats} />
        </div>

        <div className="flex gap-8">
          <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />
          <ProfileContentSection activeTab={activeTab} user={user} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
