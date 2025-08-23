import React from 'react';
import { Package, TrendingUp } from 'lucide-react';
import { OrderSearch } from '../../molecules/order';
import { Order } from '../../../hooks/useOrders';

interface OrdersPageHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalOrders: number;
  totalRevenue: number;
}

export const OrdersPageHeader: React.FC<OrdersPageHeaderProps> = ({
  searchTerm,
  onSearchChange,
  totalOrders,
  totalRevenue,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Page Title and Description */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Package className="h-8 w-8 text-primary" />
          Orders
        </h1>
        <p className="text-muted-foreground mt-2">Manage and track all customer orders for your shop</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">{formatPrice(totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <OrderSearch
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          placeholder="Search orders by ID, buyer name, or email..."
        />
      </div>
    </div>
  );
};
