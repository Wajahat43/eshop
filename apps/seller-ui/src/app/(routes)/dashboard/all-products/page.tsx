'use client';

import React, { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table';
import Link from 'next/link';
import useProduct from 'apps/seller-ui/src/hooks/useProduct';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { BarChart, ChevronRight, Eye, Pencil, Plus, PlusIcon, RotateCw, Search, Star, Trash } from 'lucide-react';
import { Dialog, Spinner } from 'apps/seller-ui/src/shared/components';
import { useRouter } from 'next/navigation';
import Input from 'packages/components/input';

const AllProducts = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { productsQuery, deleteProductMutation, restoreProductMutation } = useProduct();
  const router = useRouter();

  const columns = useMemo(() => {
    return [
      {
        accessorKey: 'image',
        header: 'Image',
        cell: ({ row }: any) => {
          const image = row.original.images[0];
          return (
            <Image
              src={image.url}
              alt={row.original.title}
              width={200}
              height={200}
              className="h-12 w-12 rounded-md object-cover"
            />
          );
        },
      },
      {
        accessorKey: 'title',
        header: 'Product Name',
        cell: ({ row }: any) => {
          const truncatedTitle =
            row.original.title.length > 25 ? row.original.title.slice(0, 25) + '...' : row.original.title;

          return (
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
              title={row.original.title}
              className="hover:underline hover:text-primary"
            >
              {truncatedTitle}
            </Link>
          );
        },
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }: any) => {
          return <span className="text-sm font-medium">{row.original.sale_price}</span>;
        },
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }: any) => {
          return (
            <span
              className={twMerge(
                'text-sm font-medium',
                row.original.stock === 10 ? 'text-destructive' : 'text-foreground',
              )}
            >
              {row.original.stock}
            </span>
          );
        },
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }: any) => {
          const category = row.original.category;
          return <span className="text-sm font-medium">{category}</span>;
        },
      },
      {
        accessorKey: 'rating',
        header: 'Rating',
        cell: ({ row }: any) => {
          return (
            <div className="flex items-center gap-1">
              <Star size={16} className="text-yellow-500" />
              <span className="text-sm font-medium">{row.original.rating}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'actions',
        header: 'Actions',
        cell: ({ row }: any) => {
          //Add eye, pencil, barchart and trash icons
          return (
            <div className="flex items-center gap-2">
              <Eye size={16} className="cursor-pointer hover:scale-105 hover:text-primary" />
              <Pencil size={16} className="cursor-pointer hover:scale-105 hover:text-primary" />
              <BarChart size={16} className="cursor-pointer hover:scale-105 hover:text-primary" />

              {row.original.isDeleted ? (
                <button
                  onClick={() => {
                    restoreProductMutation.mutate(row.original.id);
                  }}
                  disabled={restoreProductMutation.isPending}
                  className="bg-secondary text-secondary-foreground py-2 px-3 rounded-md hover:scale-102"
                >
                  {restoreProductMutation.isPending && restoreProductMutation.variables === row.original.id ? (
                    <Spinner size="sm" />
                  ) : (
                    <RotateCw size={16} className="cursor-pointer hover:scale-102 hover:text-primary" />
                  )}
                </button>
              ) : (
                <>
                  {deleteProductMutation.isPending && deleteProductMutation.variables === row.original.id ? (
                    <Spinner size="sm" />
                  ) : (
                    <Trash
                      size={16}
                      className="cursor-pointer hover:scale-102 hover:text-primary"
                      onClick={() => {
                        setSelectedProduct(row.original);
                        setShowDeleteDialog(true);
                      }}
                    />
                  )}
                </>
              )}
            </div>
          );
        },
      },
    ];
  }, []);

  const table = useReactTable({
    data: productsQuery.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="w-full min-h-svh p-8">
      {/**Header */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl font-semibold font-sans">All Products</h2>
        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:scale-102 flex items-center gap-2 transition-transform"
            onClick={() => router.push('/dashboard/create-product')}
          >
            <PlusIcon size={16} />
            Create Product
          </button>
        </div>
      </div>

      {/**BreadCrumbs */}
      <div className="flex items-center mb-4">
        <Link href="/dashboard" className="cursor-pointer opacity-90">
          Dashboard
        </Link>
        <ChevronRight />
        <span className="cursor-pointer">All Products</span>
      </div>

      {/**Search Bar */}
      <div className="mb-4 flex items-center bg-background p-2 rounded-md flex-1 relative">
        <Input
          type="text"
          placeholder="Search Products..."
          className="w-full bg-transparent text-foreground outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/**Table */}
      <div className="overflow-x-auto bg-background rounded-lg p-4">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup: any) => (
              <tr key={headerGroup.id} className="border-b border-border">
                {headerGroup.headers.map((header: any) => (
                  <th key={header.id} className="text-left p-3 font-semibold font-Poppins">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {productsQuery.isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <Spinner />
            </div>
          ) : (
            productsQuery.data && (
              <tbody>
                {table.getRowModel().rows.map((row: any) => (
                  <tr
                    key={row.id}
                    className="border-b border-border hover:border-border/20 transition-all duration-300"
                  >
                    {row.getVisibleCells().map((cell: any) => (
                      <td key={cell.id} className="p-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )
          )}
        </table>

        {/**Delete Dialog */}
        {showDeleteDialog && (
          <Dialog isOpen={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} title="Delete Product">
            <div className="text-sm text-muted-foreground mb-8">
              <p className="text-large font-semibold">Are you sure you want to delete this product? </p>
              <p className="text-md">
                Product will be moved to delete state and automatically deleted after 24 hours. You can reover it, in
                this time.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setSelectedProduct(null);
                }}
                className="bg-secondary text-secondary-foreground py-2 px-3 rounded-md hover:scale-102"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProductMutation.mutate(selectedProduct.id, {
                    onSettled: () => {
                      setShowDeleteDialog(false);
                      setSelectedProduct(null);
                    },
                  });
                }}
                disabled={deleteProductMutation.isPending}
                className="bg-destructive text-destructive-foreground py-2 px-3 rounded-md hover:scale-102"
              >
                {deleteProductMutation.isPending && deleteProductMutation.variables === selectedProduct?.id ? (
                  <Spinner size="sm" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default AllProducts;
