import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Order, useUpdateOrderStatus } from '../../../hooks/useOrders';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Eye, Package, Truck, MoreHorizontal } from 'lucide-react';

interface OrderTableRowProps {
  order: Order;
}

export const OrderTableRow: React.FC<OrderTableRowProps> = ({ order }) => {
  const router = useRouter();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const updateOrderStatus = useUpdateOrderStatus();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    try {
      await updateOrderStatus.mutateAsync({
        orderId: order.id,
        data: { status: newStatus },
      });
      setShowStatusMenu(false);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const getStatusActions = (status: Order['status']) => {
    switch (status) {
      case 'PAID':
        return (
          <button
            onClick={() => handleStatusUpdate('PROCESSING')}
            disabled={updateOrderStatus.isPending}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
          >
            <Package size={12} />
            {updateOrderStatus.isPending ? 'Updating...' : 'Process'}
          </button>
        );
      case 'PROCESSING':
        return (
          <button
            onClick={() => handleStatusUpdate('SHIPPED')}
            disabled={updateOrderStatus.isPending}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors disabled:opacity-50"
          >
            <Truck size={12} />
            {updateOrderStatus.isPending ? 'Updating...' : 'Ship'}
          </button>
        );
      case 'SHIPPED':
        return (
          <button
            onClick={() => handleStatusUpdate('DELIVERED')}
            disabled={updateOrderStatus.isPending}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
          >
            ✓ {updateOrderStatus.isPending ? 'Updating...' : 'Deliver'}
          </button>
        );
      default:
        return (
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            <MoreHorizontal size={12} />
            Change
          </button>
        );
    }
  };

  const handleViewDetails = () => {
    router.push(`/dashboard/orders/${order.id}`);
  };

  return (
    <tr className="border-b border-border hover:bg-accent/50 transition-colors">
      <td className="px-4 py-3 text-sm font-mono text-foreground">{order.id.slice(-8)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            {order.user?.avatar ? (
              <Image
                src={order.user.avatar}
                alt={order.user.name || 'Customer'}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium text-muted-foreground">
                {order.user?.name?.charAt(0)?.toUpperCase() || 'C'}
              </span>
            )}
          </div>
          <div>
            <div className="font-medium text-foreground">{order.user?.name || 'Unknown Customer'}</div>
            <div className="text-xs text-muted-foreground">{order.user?.email || 'No email'}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-foreground">{formatPrice(order.total)}</td>
      <td className="px-4 py-3">
        <OrderStatusBadge status={order.status} />
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(order.createdAt)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 relative" ref={menuRef}>
          {getStatusActions(order.status)}

          {/* Status Menu for other statuses */}
          {showStatusMenu && (
            <div className="absolute right-0 top-full mt-1 bg-background border border-border rounded-lg shadow-lg z-10 min-w-[150px]">
              <div className="py-1">
                {['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status as Order['status'])}
                    disabled={updateOrderStatus.isPending || status === order.status}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleViewDetails}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
          >
            <Eye size={12} />
            View
          </button>
        </div>
      </td>
    </tr>
  );
};
