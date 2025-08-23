import React from 'react';
import { UserOrder } from '../../../../hooks/useUserOrders';

interface OrderStatusBadgeProps {
  status: UserOrder['status'];
}

const getStatusConfig = (status: UserOrder['status']) => {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      };
    case 'PAID':
      return {
        label: 'Paid',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
      };
    case 'PROCESSING':
      return {
        label: 'Processing',
        className: 'bg-purple-100 text-purple-800 border-purple-200',
      };
    case 'SHIPPED':
      return {
        label: 'Shipped',
        className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      };
    case 'DELIVERED':
      return {
        label: 'Delivered',
        className: 'bg-green-100 text-green-800 border-green-200',
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        className: 'bg-red-100 text-red-800 border-red-200',
      };
    case 'REFUNDED':
      return {
        label: 'Refunded',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
      };
    default:
      return {
        label: status,
        className: 'bg-gray-100 text-gray-800 border-gray-200',
      };
  }
};

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
};
