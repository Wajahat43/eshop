'use client';
import React, { useMemo } from 'react';
import useSeller from '../hooks/useSeller';
import useProduct from '../hooks/useProduct';
import { useOrders } from '../hooks/useOrders';
import { useDiscountCodes } from '../hooks/useDiscountCodes';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import {
  SellerHomeEventsSection,
  SellerHomeHeader,
  SellerHomeOffersSection,
  SellerHomeOrdersSection,
  SellerHomeOverview,
  SellerHomeProductsSection,
  SellerHomeHero,
} from '../shared/organisms/home';
import { ShopSummaryCard } from '../shared/molecules/home';

const HomePage = () => {
  const { seller, isLoading: sellerLoading } = useSeller();
  const { productsQuery } = useProduct();
  const ordersQuery = useOrders();
  const { data: discountCodesData } = useDiscountCodes();

  const products = useMemo(() => productsQuery.data || [], [productsQuery.data]);
  const orders = ordersQuery.data?.data || [];
  const offers = discountCodesData?.discountCodes || [];

  // Events from products with starting_date
  type HomeProduct = { id: string; title: string; starting_date?: string | null; ending_date?: string | null };
  const events = useMemo(() => (products as HomeProduct[]).filter((p) => p.starting_date), [products]);

  // Unauthenticated friendly page
  if (!seller && !sellerLoading) {
    return (
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow p-8 text-center">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Welcome to Seller Center</h1>
          <p className="mt-2 text-muted-foreground">Sign in to view your shop overview, products, orders, and more.</p>
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow hover:opacity-95"
            >
              Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8 space-y-6">
      <SellerHomeHeader shopName={seller?.shop?.name} />
      <SellerHomeHero
        bannerUrl={seller?.shop?.coverBanner || undefined}
        avatarUrl={seller?.shop?.avatar?.url || undefined}
        name={seller?.shop?.name}
        category={seller?.shop?.category}
        address={seller?.shop?.address}
        website={seller?.shop?.website || undefined}
        rating={seller?.shop?.ratings}
      />

      {/* Overview stats */}
      <SellerHomeOverview orders={orders} products={products} offers={offers} />

      {/* Grid sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Left column */}
        <div className="lg:col-span-8 space-y-4 md:space-y-6">
          <SellerHomeProductsSection products={products} />
          <SellerHomeOrdersSection orders={orders} />
        </div>

        {/* Right column */}
        <div className="lg:col-span-4 space-y-4 md:space-y-6">
          <ShopSummaryCard
            name={seller?.shop?.name}
            category={seller?.shop?.category}
            rating={seller?.shop?.ratings}
            address={seller?.shop?.address}
            avatarUrl={seller?.shop?.avatar?.url}
            totalProducts={products.length}
            activeOffers={offers.length}
            eventsCount={events.length}
          />

          {/* Inbox Button */}
          <div className="rounded-xl border border-border bg-card text-card-foreground shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Customer Messages</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Chat with customers, answer questions, and provide support for your products.
            </p>
            <Link
              href="/inbox"
              className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow hover:opacity-95 transition-opacity"
            >
              <MessageCircle className="h-4 w-4" />
              Open Inbox
            </Link>
          </div>

          <SellerHomeOffersSection offers={offers} />
          <SellerHomeEventsSection events={events} />
        </div>
      </div>
    </main>
  );
};

export default HomePage;
