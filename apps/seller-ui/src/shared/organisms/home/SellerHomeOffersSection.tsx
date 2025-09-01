import React from 'react';
import { SectionHeader } from '../../atoms/home';
import { OffersList } from '../../molecules/home';
import Link from 'next/link';

type Offer = {
  id: string;
  public_name: string;
  discountType: string;
  discountValue: number;
  discountCode: string;
};

type SellerHomeOffersSectionProps = {
  offers: Offer[];
};

const SellerHomeOffersSection: React.FC<SellerHomeOffersSectionProps> = ({ offers }) => {
  const latest = [...(offers || [])].slice(0, 5);

  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground shadow p-4 md:p-5">
      <SectionHeader
        title="Active Offers"
        description="Discount codes available to your customers."
        action={
          <Link href="/dashboard/discount-codes" className="text-sm text-primary hover:underline">
            Manage Offers
          </Link>
        }
      />
      <div className="mt-4">
        <OffersList offers={latest} />
      </div>
    </div>
  );
};

export default SellerHomeOffersSection;
