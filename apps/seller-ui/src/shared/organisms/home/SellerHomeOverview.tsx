import React, { useMemo } from 'react';
import { SalesStatsGroup } from '../../molecules/home';

type SellerHomeOverviewProps = {
  orders?: { total: number }[];
  products?: { id: string }[];
  offers?: { id: string }[];
};

const SellerHomeOverview: React.FC<SellerHomeOverviewProps> = ({ orders = [], products = [], offers = [] }) => {
  const totalRevenue = useMemo(() => orders.reduce((acc, o) => acc + (o.total || 0), 0), [orders]);

  return (
    <SalesStatsGroup
      totalRevenue={totalRevenue}
      totalOrders={orders.length}
      totalProducts={products.length}
      activeOffers={offers.length}
    />
  );
};

export default SellerHomeOverview;
