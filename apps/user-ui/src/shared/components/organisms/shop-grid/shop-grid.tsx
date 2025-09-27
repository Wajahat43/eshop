'use client';
import React from 'react';
import { PageLoader } from '../../molecules';
import ShopCard from '../shop-card';

interface ShopGridProps {
  shops: any[];
  loading: boolean;
  error: string | null;
}

const ShopGrid = ({ shops, loading, error }: ShopGridProps) => {
  if (loading) {
    return <PageLoader message="Loading shops…" />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive text-lg">{error}</p>
      </div>
    );
  }

  if (!shops || shops.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No shops found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {shops.map((shop) => (
        <ShopCard key={shop.id} shop={shop} />
      ))}
    </div>
  );
};

export default ShopGrid;
