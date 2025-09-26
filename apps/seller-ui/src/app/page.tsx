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

  // Show loading state while checking authentication
  if (sellerLoading) {
    return (
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  // Unauthenticated friendly page
  if (!seller) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="container mx-auto max-w-6xl px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-primary/80 rounded-full mb-6">
              <span className="text-3xl font-bold text-white">S</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Seller Center
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Your gateway to building and growing your online business. Manage products, track orders, and connect with
              customers all in one place.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Management</h3>
              <p className="text-gray-600 text-sm">
                Easily add, edit, and organize your product catalog with powerful tools.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics & Insights</h3>
              <p className="text-gray-600 text-sm">
                Track your sales performance and understand your customers better.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Support</h3>
              <p className="text-gray-600 text-sm">Connect with customers through our integrated messaging system.</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-gray-200/50 shadow-lg">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Ready to start selling?</h2>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                Join thousands of successful sellers who are already growing their business with NextCart.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary to-primary/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign In to Your Account
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-white transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Create New Account
                </Link>
              </div>
            </div>
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
              href="/dashboard/inbox"
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
