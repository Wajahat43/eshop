import React from 'react';
import { StatusBadge } from '../../atoms/home';

type Product = {
  id: string;
  title: string;
  totalSales?: number;
  stock?: number;
  images?: { url: string }[];
  starting_date?: string | null;
};

type ProductSummaryListProps = {
  products: Product[];
  emptyText?: string;
};

const ProductSummaryList: React.FC<ProductSummaryListProps> = ({ products, emptyText = 'No products found' }) => {
  if (!products || products.length === 0) {
    return <div className="text-sm text-muted-foreground">{emptyText}</div>;
  }

  return (
    <ul className="divide-y divide-border">
      {products.map((p) => {
        const image = p.images?.[0]?.url;
        const isEvent = !!p.starting_date;
        const stockStatus = (p.stock ?? 0) <= 0 ? 'error' : (p.stock ?? 0) < 5 ? 'warning' : 'success';
        return (
          <li key={p.id} className="py-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded bg-muted overflow-hidden grid place-items-center text-xs">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={p.title} className="h-full w-full object-cover" />
              ) : (
                <span>IMG</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{p.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <StatusBadge label={`${p.totalSales ?? 0} sales`} status="info" />
                {isEvent ? <StatusBadge label="Event" status="warning" /> : null}
                <StatusBadge label={`Stock: ${p.stock ?? 0}`} status={stockStatus as any} />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default ProductSummaryList;
