import React from 'react';
import { SectionHeader } from '../../atoms/home';
import { ProductSummaryList } from '../../molecules/home';
import Link from 'next/link';

type Product = {
  id: string;
  title: string;
  totalSales?: number;
  stock?: number;
  images?: { url: string }[];
  starting_date?: string | null;
};

type SellerHomeProductsSectionProps = {
  products: Product[];
};

const SellerHomeProductsSection: React.FC<SellerHomeProductsSectionProps> = ({ products }) => {
  const topProducts = [...(products || [])].sort((a, b) => (b.totalSales ?? 0) - (a.totalSales ?? 0)).slice(0, 5);

  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground shadow p-4 md:p-5">
      <SectionHeader
        title="Top Products"
        description="Your best performers by total sales."
        action={
          <Link href="/dashboard/all-products" className="text-sm text-primary hover:underline">
            Manage Products
          </Link>
        }
      />
      <div className="mt-4">
        <ProductSummaryList products={topProducts} emptyText="No products yet" />
      </div>
    </div>
  );
};

export default SellerHomeProductsSection;
