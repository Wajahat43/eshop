import React from 'react';
import Image from 'next/image';
import { UserOrder } from '../../../../hooks/useUserOrders';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserOrderTableRowProps {
  order: UserOrder;
}

export const UserOrderTableRow: React.FC<UserOrderTableRowProps> = ({ order }) => {
  const router = useRouter();
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

  const handleViewDetails = () => {
    router.push(`/orders/${order.id}`);
  };

  return (
    <tr className="border-b border-border hover:bg-accent/50 transition-colors">
      <td className="px-4 py-3 text-sm font-mono text-foreground">{order.id.slice(-8)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            {order.shop?.avatar?.url ? (
              <Image
                src={order.shop.avatar.url}
                alt={order.shop.name || 'Shop'}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium text-muted-foreground">
                {order.shop?.name?.charAt(0)?.toUpperCase() || 'S'}
              </span>
            )}
          </div>
          <div>
            <div className="font-medium text-foreground">{order.shop?.name || 'Unknown Shop'}</div>
            <div className="text-xs text-muted-foreground">Shop ID: {order.shopId.slice(-6)}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-foreground">{formatPrice(order.total)}</td>
      <td className="px-4 py-3">
        <OrderStatusBadge status={order.status} />
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(order.createdAt)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
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
