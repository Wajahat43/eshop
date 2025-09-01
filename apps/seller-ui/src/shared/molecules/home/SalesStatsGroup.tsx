import React from 'react';
import { StatCard } from '../../atoms/home';

type SalesStatsGroupProps = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  activeOffers: number;
};

const currency = (v: number) => `$${v.toFixed(2)}`;

const SalesStatsGroup: React.FC<SalesStatsGroupProps> = ({
  totalRevenue,
  totalOrders,
  totalProducts,
  activeOffers,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <StatCard title="Total Revenue" value={currency(totalRevenue)} subtitle="All-time" />
      <StatCard title="Total Orders" value={totalOrders} subtitle="All-time" />
      <StatCard title="Products" value={totalProducts} subtitle="Active in shop" />
      <StatCard title="Active Offers" value={activeOffers} subtitle="Running discounts" />
    </div>
  );
};

export default SalesStatsGroup;
