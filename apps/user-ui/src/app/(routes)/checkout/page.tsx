'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import useCheckout from 'apps/user-ui/src/hooks/useCheckout';
import CheckoutForm from './CheckoutForm';

// Load Stripe outside of component to avoid recreating on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CheckoutPage = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const { sessionData, isSessionLoading, sessionError, loading, error } = useCheckout();

  // Redirect if no session ID
  if (!sessionId) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-2xl font-semibold mb-2">Invalid Checkout Session</h2>
        <p className="text-muted-foreground mb-6">No session ID provided.</p>
        <a href="/cart" className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
          Return to Cart
        </a>
      </div>
    );
  }

  // Show loading state
  if (isSessionLoading || loading) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <h2 className="text-2xl font-semibold mb-2">Loading Checkout...</h2>
        <p className="text-muted-foreground">Please wait while we prepare your checkout session.</p>
      </div>
    );
  }

  // Show error state
  if (sessionError || error) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-2xl font-semibold mb-2 text-destructive">Checkout Error</h2>
        <p className="text-muted-foreground mb-6">
          {sessionError?.message || error?.message || 'Failed to load checkout session.'}
        </p>
        <a href="/cart" className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
          Return to Cart
        </a>
      </div>
    );
  }

  // Show session expired or not found
  if (!sessionData) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-2xl font-semibold mb-2">Session Not Found</h2>
        <p className="text-muted-foreground mb-6">Your checkout session has expired or could not be found.</p>
        <a href="/cart" className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
          Return to Cart
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground">Complete your purchase for {sessionData.cart.length} item(s)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Checkout Form */}
        <div className="lg:col-span-2">
          <div className="bg-background rounded-xl border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            <Elements stripe={stripePromise}>
              <CheckoutForm sessionData={sessionData} sessionId={sessionId} />
            </Elements>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-background rounded-xl border shadow-sm p-6 space-y-4">
            <h2 className="text-xl font-semibold">Order Summary</h2>

            {/* Cart Items */}
            <div className="space-y-3">
              {sessionData.cart.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × ${item.sale_price.toFixed(2)}
                    </p>
                  </div>
                  <span className="font-semibold">${(item.quantity * item.sale_price).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <span>${sessionData.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon Info */}
            {sessionData.coupon && (
              <div className="pt-2 text-sm text-muted-foreground">Coupon applied: {sessionData.coupon.code}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
