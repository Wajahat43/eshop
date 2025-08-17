'use client';

import React, { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Trash, Plus, Minus } from 'lucide-react';
import { useStore } from 'apps/user-ui/src/store';
import useUser from 'apps/user-ui/src/hooks/userUser';
import useLocationTracking from 'apps/user-ui/src/hooks/useLocationTracking';
import useDeviceTracking from 'apps/user-ui/src/hooks/useDeviceTracking';
import useProducts from 'apps/user-ui/src/hooks/useProducts';

const WishlistPage = () => {
  const { wishlist, cart, addToCart, removeFromWishlist } = useStore();
  const { user } = useUser();

  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const { getProductsQuery } = useProducts({});

  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const enrichedWishlist = useMemo(() => {
    if (!getProductsQuery.data?.products) {
      return [];
    }
    return wishlist
      .map((item) => {
        const productDetails = getProductsQuery.data.products.find((p: any) => p.id === item.id);
        if (productDetails) {
          return { ...item, ...productDetails };
        }
        return null;
      })
      .filter(Boolean);
  }, [wishlist, getProductsQuery.data]);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(1, newQuantity) }));
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
                width={80}
                height={80}
                className="h-20 w-20 rounded-md object-cover"
              />
              <Link href={`/product/${product.slug}`} className="hover:underline hover:text-primary font-medium">
                {product.title}
              </Link>
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
          const quantity = quantities[product.id] || 1;
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleQuantityChange(product.id, quantity - 1)}
                className="p-2 rounded-full border hover:bg-muted"
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(product.id, quantity + 1)}
                className="p-2 rounded-full border hover:bg-muted"
              >
                <Plus size={16} />
              </button>
            </div>
          );
        },
      },
      {
        accessorKey: 'actions',
        header: 'Actions',
        cell: ({ row }: any) => {
          const product = row.original;
          const quantity = quantities[product.id] || 1;
          const isInCart = cart.some((item) => item.id === product.id);

          return (
            <div className="flex items-center gap-4">
              <button
                onClick={() => addToCart({ ...product, quantity }, user, location, deviceInfo)}
                disabled={isInCart}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <ShoppingCart size={18} />
                {isInCart ? 'In Cart' : 'Add to Cart'}
              </button>
              <button
                onClick={() => removeFromWishlist(product.id, user, location, deviceInfo)}
                className="p-3 rounded-full hover:bg-destructive/10 text-destructive"
              >
                <Trash size={18} />
              </button>
            </div>
          );
        },
      },
    ];
  }, [cart, quantities, addToCart, removeFromWishlist, user, location, deviceInfo]);

  const table = useReactTable({
    data: enrichedWishlist,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (getProductsQuery.isLoading) {
    return <div>Loading...</div>; // Or a spinner
  }

  if (wishlist.length === 0) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-2xl font-semibold mb-2">Your Wishlist is Empty</h2>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your wishlist yet.</p>
        <Link href="/" className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
      <div className="overflow-x-auto bg-background rounded-lg border shadow-sm">
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
                  <td key={cell.id} className="p-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WishlistPage;
