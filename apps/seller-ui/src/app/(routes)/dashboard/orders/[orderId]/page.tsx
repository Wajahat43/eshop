'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrderDetails } from '../../../../../hooks/useOrders';
import { OrderStatusBadge, OrderStatusUpdate } from '../../../../../shared/molecules/order';
import { ArrowLeft, Package, User, Calendar, DollarSign, Package as PackageIcon, Truck, MapPin } from 'lucide-react';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const { data: orderData, isLoading, error } = useOrderDetails(orderId);

  // Extract data from the new structure
  const order = orderData?.data?.order;
  const items = orderData?.data?.items;
  const shippingAddress = orderData?.data?.shippingAddress;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full animate-pulse"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Order not found</h3>
          <p className="text-muted-foreground mb-4">
            The order you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/dashboard/orders')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  // Additional safety check for order data
  if (!order.user || !items) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Invalid Order Data</h3>
          <p className="text-muted-foreground mb-4">The order data is incomplete or corrupted.</p>
          <button
            onClick={() => router.push('/dashboard/orders')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/orders')}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </button>
          <div className="h-6 w-px bg-border"></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Order #{order?.id?.slice(-8)}</h1>
            <p className="text-sm text-muted-foreground">Order Details</p>
          </div>
        </div>

        {/* Order Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                <p className="text-sm text-foreground">{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-lg font-bold text-foreground">{formatPrice(order.total)}</p>
              </div>
            </div>
          </div>

          {order.discountAmount > 0 && (
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Discount</p>
                  <p className="text-lg font-bold text-foreground text-green-600">
                    -{formatPrice(order.discountAmount)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Status Update */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Order Management</h3>
          <OrderStatusUpdate
            order={order}
            onSuccess={() => {
              // The hook will automatically update the cache and refetch data
              console.log('Order status updated successfully');
            }}
          />
        </div>

        {/* Customer Information */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <User className="h-5 w-5" />
            Customer Information
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              {order.user?.avatar ? (
                <img
                  src={order.user.avatar}
                  alt={order.user.name || 'Customer'}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-medium text-muted-foreground">
                  {order.user?.name?.charAt(0)?.toUpperCase() || 'C'}
                </span>
              )}
            </div>
            <div>
              <h4 className="text-xl font-semibold text-foreground">{order.user?.name || 'Unknown Customer'}</h4>
              <p className="text-muted-foreground">{order.user?.email || 'No email provided'}</p>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {shippingAddress && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Label:</span>
                <span className="text-sm text-foreground">{shippingAddress.label}</span>
                {shippingAddress.isDefault && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Default</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Name:</span>
                <span className="text-sm text-foreground">{shippingAddress.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Address:</span>
                <span className="text-sm text-foreground">
                  {shippingAddress.street}, {shippingAddress.city}, {shippingAddress.zip}, {shippingAddress.country}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Order Items</h3>
          <div className="space-y-4">
            {items?.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                  {item.product?.images?.[0]?.url ? (
                    <img
                      src={item.product.images[0].url}
                      alt={item.product.title || 'Product'}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <img
                      src="/placeholder-image.jpg"
                      alt={item.product?.title || 'Product'}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground text-lg">{item.product?.title || 'Unknown Product'}</h4>
                  <p className="text-muted-foreground">
                    Quantity: {item.quantity} × {formatPrice(item.price)}
                  </p>
                  {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Options:{' '}
                      {Object.entries(item.selectedOptions)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ')}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-foreground">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-muted-foreground">
                <PackageIcon className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p>No items found for this order</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Timeline */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Order Timeline</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Order Placed</p>
                <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            {order.status !== 'PENDING' && (
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Payment Confirmed</p>
                  <p className="text-xs text-muted-foreground">Payment received</p>
                </div>
              </div>
            )}

            {['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) && (
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Processing</p>
                  <p className="text-xs text-muted-foreground">Order is being prepared</p>
                </div>
              </div>
            )}

            {['SHIPPED', 'DELIVERED'].includes(order.status) && (
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 bg-indigo-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Shipped</p>
                  <p className="text-xs text-muted-foreground">Order has been shipped</p>
                </div>
              </div>
            )}

            {order.status === 'DELIVERED' && (
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Delivered</p>
                  <p className="text-xs text-muted-foreground">Order has been delivered</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
