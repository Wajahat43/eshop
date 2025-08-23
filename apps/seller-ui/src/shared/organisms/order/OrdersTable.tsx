import React from 'react';
import { Order } from '../../../hooks/useOrders';
import { OrderTableHeader, OrderTableRow } from '../../molecules/order';

interface OrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="overflow-hidden border border-border rounded-lg">
          <OrderTableHeader />
          <tbody>
            {[...Array(5)].map((_, index) => (
              <tr key={index} className="border-b border-border">
                {[...Array(6)].map((_, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No orders found</h3>
        <p className="text-muted-foreground">When customers place orders, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-hidden border border-border rounded-lg">
        <table className="min-w-full divide-y divide-border">
          <OrderTableHeader />
          <tbody className="bg-background divide-y divide-border">
            {orders.map((order) => (
              <OrderTableRow key={order.id} order={order} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
