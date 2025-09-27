'use client';

import React from 'react';
import {
  SellerHomeHeader,
  SellerHomeOverview,
  SellerHomeProductsSection,
  SellerHomeOffersSection,
  SellerHomeOrdersSection,
  SellerHomeEventsSection,
  SellerHomeHero,
} from '../../../shared/organisms/home';
import { useOrders } from '../../../hooks/useOrders';
import useProduct from '../../../hooks/useProduct';
import { useShopInfo } from '../../../hooks/useShop';
import { useDiscountCodes } from '../../../hooks/useDiscountCodes';
import { useEvents } from '../../../hooks/useEvents';
import useSeller from '../../../hooks/useSeller';

const DashboardPage = () => {
  // Fetch data for dashboard
  const { data: ordersData } = useOrders();
  const { productsQuery } = useProduct();
  const { data: shopData } = useShopInfo();
  const { data: discountCodesData } = useDiscountCodes();
  const { data: eventsData } = useEvents(1, 10); // Fetch first 10 events
  const { seller } = useSeller();

  const orders = ordersData?.data || [];
  const products = productsQuery?.data || [];
  const offers = discountCodesData?.discountCodes || [];
  const events = eventsData?.events || [];
  const shopName = shopData?.name || 'Your Shop';

  // Hero props from shop and seller data
  const heroProps = {
    bannerUrl: shopData?.coverBanner || null,
    avatarUrl: shopData?.avatar?.url || null,
    name: shopData?.name || seller?.name || 'Your Shop',
    category: shopData?.category || undefined,
    address: shopData?.address || undefined,
    website: shopData?.website || null,
    rating: shopData?.ratings || undefined,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <SellerHomeHero {...heroProps} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <SellerHomeHeader shopName={shopName} />

        {/* Overview Stats */}
        <div className="mb-8">
          <SellerHomeOverview orders={orders} products={products} offers={offers} />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-1">
            <SellerHomeOrdersSection orders={orders} />
          </div>

          {/* Products Section */}
          <div className="lg:col-span-1">
            <SellerHomeProductsSection products={products} />
          </div>
        </div>

        {/* Additional Sections */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Offers Section */}
          <div className="lg:col-span-1">
            <SellerHomeOffersSection offers={offers} />
          </div>

          {/* Events Section */}
          <div className="lg:col-span-1">
            <SellerHomeEventsSection events={events} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
