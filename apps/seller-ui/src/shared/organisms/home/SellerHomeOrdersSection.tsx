import React from 'react';
import { SectionHeader } from '../../atoms/home';
import { RecentOrdersCompact } from '../../molecules/home';
import Link from 'next/link';

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

type SellerHomeOrdersSectionProps = {
  orders: Order[];
};

const SellerHomeOrdersSection: React.FC<SellerHomeOrdersSectionProps> = ({ orders }) => {
  const recent = [...(orders || [])].slice(0, 5);

  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground shadow p-4 md:p-5">
      <SectionHeader
        title="Recent Orders"
        description="Latest orders from your customers."
        action={
          <Link href="/dashboard/orders" className="text-sm text-primary hover:underline">
            View All Orders
          </Link>
        }
      />
      <div className="mt-4">
        <RecentOrdersCompact orders={recent} />
      </div>
    </div>
  );
};

export default SellerHomeOrdersSection;
