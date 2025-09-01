import React from 'react';
import { SectionHeader } from '../../atoms/home';
import Link from 'next/link';

type SellerHomeHeaderProps = {
  shopName?: string;
};

const SellerHomeHeader: React.FC<SellerHomeHeaderProps> = ({ shopName }) => {
  return (
    <div className="mb-4 md:mb-6">
      <SectionHeader
        title={shopName ? `Welcome back, ${shopName}` : 'Welcome back'}
        description="Here’s a quick snapshot of your shop at a glance."
        action={
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium shadow hover:opacity-95"
          >
            Go to Dashboard
          </Link>
        }
      />
    </div>
  );
};

export default SellerHomeHeader;
