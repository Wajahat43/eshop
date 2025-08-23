'use client';

import React, { useState, useMemo } from 'react';
import { useUserOrders, UserOrder } from '../../../../../hooks/useUserOrders';
import { UserOrdersTable } from '../../../molecules/order';
import { Search } from 'lucide-react';

export const UserOrdersPage: React.FC = () => {
  const { data: ordersData, isLoading, error } = useUserOrders();
  const [searchTerm, setSearchTerm] = useState('');

  // Extract total from the query data
  const total = ordersData?.total || 0;

  // Filter orders based on search term
  const filteredOrders = useMemo(() => {
    const currentOrders = ordersData?.data || [];
    if (!searchTerm.trim()) return currentOrders;

    const searchLower = searchTerm.toLowerCase();
    return currentOrders.filter(
      (order: UserOrder) =>
        order.id.toLowerCase().includes(searchLower) ||
        order.shop?.name?.toLowerCase().includes(searchLower) ||
        order.status.toLowerCase().includes(searchLower),
    );
  }, [ordersData?.data, searchTerm]);

  // Calculate total spent from filtered orders
  const totalSpent = useMemo(() => {
    return filteredOrders.reduce((sum: number, order: UserOrder) => sum + order.total, 0);
  }, [filteredOrders]);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Error loading orders</h3>
        <p className="text-muted-foreground mb-4">There was a problem loading your orders.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Search */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Orders</h2>
          <p className="text-muted-foreground">Track your orders from all shops</p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders by ID, shop, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Orders</div>
            <div className="text-2xl font-bold text-foreground">{filteredOrders.length}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Spent</div>
            <div className="text-2xl font-bold text-foreground">${totalSpent.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Order List</h3>
          <p className="text-sm text-muted-foreground">
            Showing {filteredOrders.length} of {total} orders
          </p>
        </div>

        <UserOrdersTable orders={filteredOrders} isLoading={isLoading} />
      </div>
    </div>
  );
};
