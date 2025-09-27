'use client';

import React from 'react';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ArrowRight, Clock, MessageCircle, PackageCheck, ShieldCheck } from 'lucide-react';
import useCheckout from 'apps/user-ui/src/hooks/useCheckout';
import CheckoutForm from './CheckoutForm';
import ProtectedRoute from '../../../shared/components/guards/protected-route';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const checkoutSteps = [
  { label: 'Review cart', status: 'complete' },
  { label: 'Secure payment', status: 'current' },
  { label: 'Order tracking', status: 'upcoming' },
];

const CheckoutPage = () => {
  return (
    <ProtectedRoute fallback={<CheckoutAccessFallback />}>
      <CheckoutContent />
    </ProtectedRoute>
  );
};

const CheckoutAccessFallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      <div>
        <p className="text-base font-semibold text-foreground">Hold on...</p>
        <p className="text-sm text-muted-foreground">We&apos;re getting your secure checkout ready.</p>
      </div>
    </div>
  </div>
);

interface CheckoutStateProps {
  tone?: 'default' | 'error';
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

const CheckoutState = ({ tone = 'default', title, description, actionLabel, actionHref }: CheckoutStateProps) => {
  const toneStyles = tone === 'error' ? 'border-destructive/40 bg-destructive/5' : 'border-border/60 bg-card/80';
  const toneHeading = tone === 'error' ? 'text-destructive' : 'text-foreground';

  return (
    <div
      className={`mx-auto flex min-h-[50vh] w-[90%] max-w-3xl flex-col items-center justify-center rounded-3xl border ${toneStyles} px-8 py-16 text-center shadow-lg`}
    >
      <h2 className={`text-2xl font-semibold ${toneHeading}`}>{title}</h2>
      <p className="mt-3 max-w-prose text-sm text-muted-foreground">{description}</p>
      {actionHref && actionLabel && (
        <a
          href={actionHref}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </a>
      )}
    </div>
  );
};

const CheckoutLoading = () => (
  <div className="mx-auto w-[90%] max-w-6xl py-16">
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-6">
        <div className="h-32 rounded-2xl bg-muted/40 animate-pulse" />
        <div className="h-[420px] rounded-2xl bg-muted/40 animate-pulse" />
        <div className="h-32 rounded-2xl bg-muted/40 animate-pulse" />
      </div>
      <div className="h-[520px] rounded-2xl bg-muted/40 animate-pulse" />
    </div>
  </div>
);

const CheckoutContent = () => {
  const {
    sessionId,
    sessionData,
    isSessionLoading,
    sessionError,
    error,
    createPaymentIntent,
    isCreatingPaymentIntent,
    paymentIntentError,
  } = useCheckout();

  if (!sessionId) {
    return (
      <CheckoutState
        title="Invalid checkout session"
        description="We couldn't find a session to process. Return to your cart to start the checkout again."
        actionLabel="Return to cart"
        actionHref="/cart"
      />
    );
  }

  // Keep Elements and form mounted during payment to avoid unmounting CardElement
  if (isSessionLoading) {
    return <CheckoutLoading />;
  }

  const errorMessage = sessionError?.message || (error instanceof Error ? error.message : undefined);
  if (errorMessage) {
    return (
      <CheckoutState
        tone="error"
        title="Checkout error"
        description={errorMessage || 'Something went wrong while preparing your secure checkout.'}
        actionLabel="Back to cart"
        actionHref="/cart"
      />
    );
  }

  if (!sessionData) {
    return (
      <CheckoutState
        title="Session expired"
        description="Your checkout session has expired or could not be found. Please go back to your cart and try again."
        actionLabel="Return to cart"
        actionHref="/cart"
      />
    );
  }

  const items = sessionData.cart || [];
  const perItemCoupons: Record<string, any> = sessionData.perItemCoupons || {};
  const totalDiscount = sessionData.appliedCoupons?.totalDiscount || 0;
  const sellerLookup = new Map<string, any>();
  (sessionData.sellers || []).forEach((seller: any) => {
    sellerLookup.set(String(seller.shopId), seller);
  });

  const subtotal = items.reduce((sum: number, item: any) => sum + (item.sale_price || 0) * (item.quantity || 0), 0);
  const totalItems = items.reduce((count: number, item: any) => count + (item.quantity || 0), 0);
  const totalAmount = sessionData.discountedTotal || (sessionData.totalAmount || subtotal) - totalDiscount;

  const nextSteps = [
    'You will receive order confirmation emails from each seller in your cart.',
    'Track your package progress from the Orders section once payment succeeds.',
    'Chat with sellers in real time if you need customisation or shipping updates.',
  ];

  return (
    <div className="relative isolate bg-gradient-to-b from-background via-background to-primary/5 pb-16 pt-10 sm:pt-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-48 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent" />

      <div className="relative z-10 mx-auto w-[90%] max-w-6xl space-y-10">
        <header className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            <ShieldCheck className="h-4 w-4" /> Secured by Stripe
          </span>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Complete your checkout</h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              You&apos;re moments away from checkout. We process each seller separately so every artisan ships securely
              and on time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {checkoutSteps.map((step, index) => (
              <React.Fragment key={step.label}>
                <div
                  className={`flex items-center gap-2 rounded-full border px-3 py-1 ${
                    step.status === 'complete'
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : step.status === 'current'
                      ? 'border-border/60 bg-background text-foreground'
                      : 'border-border/40 bg-background/60'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      step.status === 'complete'
                        ? 'bg-primary text-primary-foreground'
                        : step.status === 'current'
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span>{step.label}</span>
                </div>
                {index < checkoutSteps.length - 1 && (
                  <span className="hidden text-muted-foreground/60 sm:inline">/</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.75fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Payment overview</p>
                  <h2 className="mt-2 text-xl font-semibold text-foreground">
                    Paying {totalItems} item{totalItems === 1 ? '' : 's'} across {sellerLookup.size || 1} shop
                    {sellerLookup.size === 1 ? '' : 's'}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We split the payment per shop so each seller receives funds instantly and can begin fulfilment.
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm">
                  <PackageCheck className="h-4 w-4 text-primary" /> Total ${totalAmount.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/90 p-6 shadow-xl">
              <div className="mb-6 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Payment information</h3>
                  <p className="text-xs text-muted-foreground">
                    Card details are encrypted and never stored on NextCart.
                  </p>
                </div>
              </div>
              <Elements stripe={stripePromise} key={sessionId}>
                <CheckoutForm
                  sessionData={sessionData}
                  sessionId={sessionId}
                  createPaymentIntent={createPaymentIntent}
                  isCreatingPaymentIntent={isCreatingPaymentIntent}
                  paymentIntentError={paymentIntentError}
                />
              </Elements>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/80 p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold text-foreground">What happens after payment</h3>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {nextSteps.map((step) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-16">
            <div className="rounded-2xl border border-border/60 bg-card/90 p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Order summary</h2>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {totalItems} item{totalItems === 1 ? '' : 's'}
                </span>
              </div>

              <div className="mt-4 space-y-4">
                {items.map((item: any, index: number) => {
                  const original = (item.sale_price || 0) * (item.quantity || 0);
                  const itemDiscount = perItemCoupons[item.id]?.discountAmount || 0;
                  const final = Math.max(original - itemDiscount, 0);
                  const seller = sellerLookup.get(String(item.shopId));
                  const sellerName = seller?.shopName || seller?.name || seller?.shop?.name;
                  const imageSrc = item?.images?.[0]?.url || '/placeholder-image.jpg';
                  return (
                    <div
                      key={`${item.id || item.slug || index}-summary`}
                      className="flex items-start gap-4 rounded-xl border border-border/40 bg-background/80 p-3"
                    >
                      <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-border/60 bg-muted">
                        <Image
                          src={imageSrc}
                          alt={item.title || 'Product image'}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        {sellerName && <p className="text-xs text-muted-foreground">Sold by {sellerName}</p>}
                        <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground line-through">
                          {itemDiscount ? `$${original.toFixed(2)}` : ''}
                        </p>
                        <span className="text-sm font-semibold text-foreground">${final.toFixed(2)}</span>
                        {perItemCoupons[item.id]?.code ? (
                          <p className="text-[11px] text-emerald-600">Coupon {perItemCoupons[item.id].code}</p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 space-y-3 border-t border-border/50 pt-4 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600">
                    <span>Discounts</span>
                    <span>- ${totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-lg font-semibold text-foreground">
                  <span>Total due</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Pricing includes all platform fees. Taxes might be calculated at fulfilment based on your delivery
                  address.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/70 p-6">
              <div className="flex items-start gap-3">
                <MessageCircle className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-base font-semibold text-foreground">Need a hand?</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Chat with sellers directly from your inbox for sizing help, delivery adjustments, or bundled
                    shipping.
                  </p>
                  <a
                    href="/inbox"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
                  >
                    Open inbox
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
