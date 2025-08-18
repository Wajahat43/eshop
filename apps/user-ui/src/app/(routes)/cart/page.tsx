'use client';

import React, { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import Link from 'next/link';
import Image from 'next/image';
import { Trash, Plus, Minus } from 'lucide-react';
import { useStore } from 'apps/user-ui/src/store';
import useUser from 'apps/user-ui/src/hooks/userUser';
import useLocationTracking from 'apps/user-ui/src/hooks/useLocationTracking';
import useDeviceTracking from 'apps/user-ui/src/hooks/useDeviceTracking';
import useProducts from 'apps/user-ui/src/hooks/useProducts';
import { useUserAddresses } from 'apps/user-ui/src/hooks/useUserAddresses';

const CartPage = () => {
  const { cart, removeFromCart, setCartQuantity } = useStore();
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const { getProductsQuery } = useProducts({});
  const { data: addresses = [], isLoading: addressesLoading } = useUserAddresses();

  const [coupon, setCoupon] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('online');

  // Auto-select default address when addresses load
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

  const handleQuantityChange = (product: any, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(product.id, user, location, deviceInfo);
    } else {
      setCartQuantity(product.id, newQuantity);
    }
  };

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
                src={product.images[0]?.url || '/images/placeholder.png'}
                alt={product.title}
                width={100}
                height={100}
                className="h-24 w-24 rounded-lg object-cover"
              />
              <div>
                <Link
                  href={`/product/${product.slug}`}
                  className="hover:underline hover:text-primary font-semibold text-lg"
                >
                  {product.title}
                </Link>
                <p className="text-sm text-muted-foreground">{product.category}</p>
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
  }, [removeFromCart, setCartQuantity, user, location, deviceInfo]);

  const table = useReactTable({
    data: enrichedCart,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const subtotal = useMemo(() => {
    return enrichedCart.reduce((acc, item) => acc + item.sale_price * item.quantity, 0);
  }, [enrichedCart]);

  const total = subtotal; // For now, total is the same as subtotal

  if (getProductsQuery.isLoading) {
    return <div>Loading...</div>; // Or a spinner
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
          <hr />
          <div className="space-y-2">
            <label htmlFor="coupon" className="font-medium">
              Have a coupon?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="coupon"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-grow p-2 border rounded-md bg-background text-foreground border-border"
              />
              <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">
                Apply
              </button>
            </div>
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
              selectedAddressId
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
            disabled={!selectedAddressId}
            onClick={() => {
              if (!selectedAddressId) {
                alert('Please select a shipping address');
              } else {
                // Proceed to checkout logic here
                console.log('Proceeding to checkout with address:', selectedAddressId);
              }
            }}
          >
            {selectedAddressId ? 'Proceed to Checkout' : 'Select Shipping Address'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
