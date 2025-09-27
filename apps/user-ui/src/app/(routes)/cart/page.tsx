'use client';

import React, { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import Link from 'next/link';
import Image from 'next/image';
import { Trash, Plus, Minus, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useStore } from 'apps/user-ui/src/store';
import useUser from 'apps/user-ui/src/hooks/userUser';
import useLocationTracking from 'apps/user-ui/src/hooks/useLocationTracking';
import useDeviceTracking from 'apps/user-ui/src/hooks/useDeviceTracking';
import useProducts from 'apps/user-ui/src/hooks/useProducts';
import { useUserAddresses } from 'apps/user-ui/src/hooks/useUserAddresses';
import usePaymentSession from 'apps/user-ui/src/hooks/usePaymentSession';
import ProtectedRoute from '../../../shared/components/guards/protected-route';
import { PageLoader } from '../../../shared/components/molecules';

import Input from 'packages/components/input';

const CartPage = () => {
  return (
    <ProtectedRoute fallback={<CartLoadingFallback />}>
      <CartScreen />
    </ProtectedRoute>
  );
};

const CartLoadingFallback = () => <PageLoader message="Loading your cart…" />;

const CartScreen = () => {
  const { cart, removeFromCart, setCartQuantity } = useStore();
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const { getProductsQuery } = useProducts({});
  const { data: addresses = [], isLoading: addressesLoading } = useUserAddresses();
  const {
    createPaymentSession,
    isLoading: isCreatingSession,
    error: sessionError,
    appliedCoupons,
    perItemCoupons,
    invalidCouponCodes,
    unappliedCouponCodes,
    couponCodes,
    updateCouponState,
    resetCouponState,
  } = usePaymentSession();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('online');

  React.useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else {
        setSelectedAddressId(addresses[0].id);
      }
    }
  }, [addresses, selectedAddressId]);

  const enrichedCart = useMemo(() => {
    if (!getProductsQuery.data?.products) {
      return [];
    }
    return cart
      .map((item) => {
        const productDetails = getProductsQuery.data.products.find((p: any) => p.id === item.id);
        if (productDetails) {
          return { ...item, ...productDetails };
        }
        return null;
      })
      .filter(Boolean);
  }, [cart, getProductsQuery.data]);

  const previousCartSignatureRef = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    if (enrichedCart.length === 0) {
      previousCartSignatureRef.current = undefined;
      resetCouponState();
      return;
    }

    const signature = enrichedCart.map((item: any) => `${item.id}:${item.quantity}`).join('|');

    if (previousCartSignatureRef.current !== signature) {
      previousCartSignatureRef.current = signature;
      if (couponCodes.length > 0) {
        updateCouponState(enrichedCart, couponCodes);
      }
    }
  }, [enrichedCart, couponCodes, updateCouponState, resetCouponState]);

  const handleAddCoupon = async () => {
    const trimmed = couponInput.trim();

    if (!trimmed) {
      setCouponError('Enter a coupon code');
      return;
    }

    if (couponCodes.includes(trimmed)) {
      setCouponError('Coupon already added');
      return;
    }

    if (enrichedCart.length === 0) {
      setCouponError('Add items to cart before applying coupons');
      return;
    }

    const previousCodes = [...couponCodes];

    try {
      const result = await updateCouponState(enrichedCart, [...couponCodes, trimmed]);
      const invalid = result?.invalidCouponCodes ?? [];
      const unapplied = result?.unappliedCouponCodes ?? [];

      if (invalid.includes(trimmed) || unapplied.includes(trimmed)) {
        setCouponError(
          invalid.includes(trimmed) ? 'Coupon is invalid' : 'Coupon does not apply to any items in your cart',
        );
        await updateCouponState(enrichedCart, previousCodes);
      } else {
        setCouponError(null);
      }

      setCouponInput('');
    } catch (error) {
      console.error('Failed to validate coupon:', error);
      setCouponError('Unable to validate coupon right now');
    }
  };

  const handleRemoveCoupon = async (code: string) => {
    if (enrichedCart.length === 0) {
      resetCouponState();
      return;
    }

    setCouponError(null);

    try {
      await updateCouponState(
        enrichedCart,
        couponCodes.filter((couponCode) => couponCode.toLowerCase() !== code.toLowerCase()),
      );
    } catch (error) {
      console.error('Failed to update coupons after removal:', error);
      setCouponError('Unable to update coupons right now');
    }
  };

  const handleQuantityChange = (product: any, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(product.id, user, location, deviceInfo);
    } else {
      setCartQuantity(product.id, newQuantity);
    }
  };

  const perItemCouponLookup = perItemCoupons || {};

  const columns = useMemo(() => {
    return [
      {
        accessorKey: 'product',
        header: 'Product',
        cell: ({ row }: any) => {
          const product = row.original;
          return (
            <div className="flex items-center gap-4">
              <Image
                src={product.images?.[0]?.url || '/placeholder-image.jpg'}
                alt={product.title}
                width={100}
                height={100}
                className="h-24 w-24 rounded-lg object-cover"
              />
              <div className="space-y-1">
                <Link
                  href={`/product/${product.slug}`}
                  className="hover:underline hover:text-primary font-semibold text-lg"
                >
                  {product.title}
                </Link>
                <p className="text-sm text-muted-foreground">{product.category}</p>
                {perItemCouponLookup[product.id]?.code ? (
                  <div className="flex items-center gap-1 text-emerald-600 text-xs sm:text-sm">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>
                      Coupon {perItemCouponLookup[product.id].code} (-
                      {perItemCouponLookup[product.id].discountType === 'PERCENT'
                        ? `${perItemCouponLookup[product.id].discountValue}%`
                        : `$${perItemCouponLookup[product.id].discountAmount.toFixed(2)}`}
                      )
                    </span>
                  </div>
                ) : appliedCoupons?.coupons?.length > 0 ? (
                  <div className="flex items-center gap-1 text-amber-600 text-xs sm:text-sm">
                    <AlertCircle className="h-3 w-3" />
                    <span>No coupon applied</span>
                  </div>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }: any) => {
          return <span className="text-lg font-semibold">${row.original.sale_price.toFixed(2)}</span>;
        },
      },
      {
        accessorKey: 'quantity',
        header: 'Quantity',
        cell: ({ row }: any) => {
          const product = row.original;
          return (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleQuantityChange(product, product.quantity - 1)}
                className="p-2 rounded-full border hover:bg-muted transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-bold text-lg">{product.quantity}</span>
              <button
                onClick={() => handleQuantityChange(product, product.quantity + 1)}
                className="p-2 rounded-full border hover:bg-muted transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          );
        },
      },
      {
        accessorKey: 'actions',
        header: ' ',
        cell: ({ row }: any) => {
          const product = row.original;
          return (
            <button
              onClick={() => removeFromCart(product.id, user, location, deviceInfo)}
              className="p-3 rounded-full hover:bg-destructive/10 text-destructive"
            >
              <Trash size={20} />
            </button>
          );
        },
      },
    ];
  }, [removeFromCart, setCartQuantity, user, location, deviceInfo, perItemCouponLookup, appliedCoupons]);

  const table = useReactTable({
    data: enrichedCart,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const subtotal = useMemo(() => {
    return enrichedCart.reduce((acc, item) => acc + item.sale_price * item.quantity, 0);
  }, [enrichedCart]);

  const discountAmount = appliedCoupons?.totalDiscount ?? 0;
  const total = useMemo(() => Math.max(subtotal - discountAmount, 0), [subtotal, discountAmount]);

  if (getProductsQuery.isLoading) {
    return <PageLoader message="Loading your cart…" />;
  }

  if (cart.length === 0) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-2xl font-semibold mb-2">Your Cart is Empty</h2>
        <p className="text-muted-foreground mb-6">Looks like you haven&apos;t added anything to your cart yet.</p>
        <Link href="/" className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Cart Table */}
        <div className="lg:col-span-2 overflow-x-auto bg-background rounded-xl border shadow-sm">
          <table className="w-full">
            <thead className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="text-left p-4 font-semibold">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b last:border-b-0">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:col-span-1 bg-background rounded-xl border shadow-sm p-6 space-y-6">
          <h2 className="text-2xl font-semibold">Order Summary</h2>
          <div className="flex justify-between items-center text-lg">
            <span>Subtotal</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-emerald-600">
            <span>Discounts</span>
            <span>- ${discountAmount.toFixed(2)}</span>
          </div>
          <hr />
          <div className="space-y-2">
            <label htmlFor="coupon" className="font-medium">
              Have a coupon?
            </label>
            <div className="flex gap-2 flex-wrap">
              <Input
                type="text"
                id="coupon"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-grow"
              />
              <button
                type="button"
                onClick={handleAddCoupon}
                disabled={!couponInput.trim()}
                className={`px-4 py-2 rounded-md border transition-colors ${
                  couponInput.trim()
                    ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                Apply
              </button>
            </div>
            {couponError && <p className="text-destructive text-sm">{couponError}</p>}
            {sessionError && <p className="text-destructive text-sm">{sessionError.message}</p>}
            {invalidCouponCodes && invalidCouponCodes.length > 0 && (
              <p className="text-destructive text-xs">Invalid: {invalidCouponCodes.join(', ')}</p>
            )}
            {unappliedCouponCodes && unappliedCouponCodes.length > 0 && (
              <p className="text-amber-600 text-xs">Not applied: {unappliedCouponCodes.join(', ')}</p>
            )}
            {couponCodes.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Applied coupons</p>
                <div className="flex flex-wrap gap-2">
                  {couponCodes.map((code) => (
                    <span
                      key={code}
                      className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs"
                    >
                      {code}
                      <button type="button" onClick={() => handleRemoveCoupon(code)} className="text-primary">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {appliedCoupons?.coupons?.length ? (
              <div className="space-y-1 text-xs text-muted-foreground">
                {appliedCoupons.coupons.map((coupon: any) => (
                  <div key={coupon.code} className="flex justify-between">
                    <span>{coupon.code}</span>
                    <span>- ${coupon.discountAmount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <hr />
          <div className="space-y-2">
            <label htmlFor="shipping" className="font-medium">
              Select shipping address
            </label>
            {addressesLoading ? (
              <div className="p-2 text-sm text-muted-foreground">Loading addresses...</div>
            ) : addresses.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">
                No addresses found.{' '}
                <Link href="/profile?tab=shipping" className="text-primary hover:underline">
                  Add an address in your profile
                </Link>
              </div>
            ) : (
              <select
                id="shipping"
                value={selectedAddressId}
                onChange={(e) => setSelectedAddressId(e.target.value)}
                className="w-full p-2 border rounded-md bg-background text-foreground border-border"
              >
                <option value="">Select a shipping address</option>
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.label}: {address.name} - {address.street}, {address.city}, {address.zip}, {address.country}
                    {address.isDefault && ' (Default)'}
                  </option>
                ))}
              </select>
            )}
          </div>
          <hr />
          <div className="space-y-2">
            <label htmlFor="payment" className="font-medium">
              Select payment method
            </label>
            <select
              id="payment"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2 border rounded-md bg-background text-foreground border-border"
            >
              <option value="online">Online</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>
          <hr />
          <div className="flex justify-between items-center text-2xl font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <hr />
          <button
            className={`w-full py-3 rounded-lg font-semibold text-lg transition-colors ${
              selectedAddressId && !isCreatingSession
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
            disabled={!selectedAddressId || isCreatingSession}
            onClick={async () => {
              if (!selectedAddressId) {
                alert('Please select a shipping address');
                return;
              }

              if (!user?.id) {
                alert('Please log in to proceed with checkout');
                return;
              }

              try {
                await createPaymentSession({
                  cart: enrichedCart,
                  userId: user.id,
                  selectedAddressId,
                  couponCodes: couponCodes,
                });
              } catch (err) {
                console.error('Failed to create payment session:', err);
              }
            }}
          >
            {isCreatingSession
              ? 'Creating Session...'
              : selectedAddressId
              ? 'Proceed to Checkout'
              : 'Select Shipping Address'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
