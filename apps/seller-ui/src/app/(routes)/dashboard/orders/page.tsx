'use client';

import React, { useState, useMemo } from 'react';
import { useOrders } from '../../../../hooks/useOrders';
import { OrdersPageHeader } from '../../../../shared/organisms/order/OrdersPageHeader';
import { OrdersTable } from '../../../../shared/organisms/order/OrdersTable';
import { Order } from '../../../../hooks/useOrders';

export default function OrdersPage() {
  const { data: ordersData, isLoading, error } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');

  // Extract orders and total from the query data
  const orders = ordersData?.data || [];
  const total = ordersData?.total || 0;

  // Filter orders based on search term
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;

    const searchLower = searchTerm.toLowerCase();
    return orders.filter(
      (order: Order) =>
        order.id.toLowerCase().includes(searchLower) ||
        order.user?.name?.toLowerCase().includes(searchLower) ||
        order.user?.email?.toLowerCase().includes(searchLower),
    );
  }, [orders, searchTerm]);

  // Calculate total revenue from filtered orders
  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce((sum: number, order: Order) => sum + order.total, 0);
  }, [filteredOrders]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
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
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Page Header with Search */}
        <OrdersPageHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          totalOrders={filteredOrders.length}
          totalRevenue={totalRevenue}
        />

        {/* Orders Table */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">Order List</h2>
            <p className="text-sm text-muted-foreground">
              Showing {filteredOrders.length} of {total} orders
            </p>
          </div>

          <OrdersTable orders={filteredOrders} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
