import React from 'react';
import { StatusBadge } from '../../atoms/home';

type Order = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
};

type RecentOrdersCompactProps = {
  orders: Order[];
};

const RecentOrdersCompact: React.FC<RecentOrdersCompactProps> = ({ orders }) => {
  if (!orders || orders.length === 0) {
    return <div className="text-sm text-muted-foreground">No recent orders</div>;
  }

  const toStatus = (s: string) => {
    switch (s) {
      case 'PAID':
      case 'DELIVERED':
        return 'success';
      case 'PROCESSING':
      case 'SHIPPED':
        return 'info';
      case 'CANCELLED':
      case 'REFUNDED':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <ul className="divide-y divide-border">
      {orders.map((o) => (
        <li key={o.id} className="py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{o.user?.name || 'Customer'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{new Date(o.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">${o.total.toFixed(2)}</span>
            <StatusBadge label={o.status} status={toStatus(o.status)} />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default RecentOrdersCompact;
