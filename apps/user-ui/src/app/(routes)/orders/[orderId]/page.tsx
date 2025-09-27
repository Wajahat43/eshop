'use client';

import React from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useUserOrderDetails } from '../../../../hooks/useUserOrderDetails';
import { ArrowLeft, DollarSign, MapPin, Package as PackageIcon } from 'lucide-react';
import { PageLoader } from 'apps/user-ui/src/shared/components/molecules';

export default function UserOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const { data, isLoading, error } = useUserOrderDetails(orderId);
  const order = data?.data?.order;
  const items = data?.data?.items || [];
  const shippingAddress = data?.data?.shippingAddress || null;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageLoader message="Loading your orders..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/profile?tab=orders')}
          className="px-3 py-2 rounded bg-primary text-primary-foreground"
        >
          Back to orders
        </button>
        <p className="mt-4 text-destructive">Unable to load order.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/profile?tab=orders')}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Back to Orders
        </button>
        <div className="h-6 w-px bg-border" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order #{order.id.slice(-8)}</h1>
          <p className="text-sm text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-lg font-bold text-foreground">{formatPrice(order.total)}</p>
            </div>
          </div>
        </div>

        {order.totalDiscount || order.discountAmount ? (
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Discount</p>
                <p className="text-lg font-bold text-foreground text-green-600">
                  -{formatPrice(order.totalDiscount || order.discountAmount || 0)}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {shippingAddress && (
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ship to</p>
                <p className="text-sm text-foreground">
                  {shippingAddress.name} — {shippingAddress.street}, {shippingAddress.city}, {shippingAddress.zip},{' '}
                  {shippingAddress.country}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {order?.appliedCoupons?.coupons?.length ? (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-base font-semibold text-foreground mb-2">Coupons</h3>
          <div className="text-sm text-muted-foreground">
            {order.appliedCoupons.coupons.map((c, idx) => (
              <span key={c.code} className="mr-3">
                <span className="text-foreground">{c.code}</span> (-{formatPrice(c.discountAmount)})
                {idx < order.appliedCoupons!.coupons.length - 1 ? ',' : ''}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Items</h3>
        <div className="space-y-4">
          {items.length ? (
            items.map((item) => {
              const original = item.price * item.quantity;
              const discount = item.discountAmount || 0;
              const final = Math.max(original - discount, 0);
              const imageSrc = item.product?.images?.[0]?.url || '/placeholder-image.jpg';
              return (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="relative w-20 h-20 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={imageSrc}
                      alt={item.product?.title || 'Product'}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground text-lg">{item.product?.title || 'Product'}</h4>
                    <p className="text-muted-foreground">
                      Quantity: {item.quantity} × {formatPrice(item.price)}
                    </p>
                    {item.coupon?.code ? (
                      <p className="text-xs text-emerald-600 mt-1">
                        Coupon {item.coupon.code} applied (-
                        {item.coupon.discountType === 'PERCENT'
                          ? `${item.coupon.discountValue}%`
                          : `${formatPrice(item.coupon.discountAmount)}`}
                        )
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground line-through">
                      {discount ? formatPrice(original) : ''}
                    </p>
                    <p className="text-xl font-bold text-foreground">{formatPrice(final)}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <PackageIcon className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
              <p>No items found for this order</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
