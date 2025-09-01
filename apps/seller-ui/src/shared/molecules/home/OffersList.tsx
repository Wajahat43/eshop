import React from 'react';
import { StatusBadge } from '../../atoms/home';

type Offer = {
  id: string;
  public_name: string;
  discountType: string;
  discountValue: number;
  discountCode: string;
};

type OffersListProps = {
  offers: Offer[];
};

const OffersList: React.FC<OffersListProps> = ({ offers }) => {
  if (!offers || offers.length === 0) {
    return <div className="text-sm text-muted-foreground">No active discount codes</div>;
  }

  return (
    <ul className="divide-y divide-border">
      {offers.map((o) => (
        <li key={o.id} className="py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{o.public_name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Code: {o.discountCode}</p>
          </div>
          <div className="shrink-0">
            <StatusBadge
              label={`${o.discountType === 'percentage' ? `${o.discountValue}%` : `$${o.discountValue}`} off`}
              status="success"
            />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default OffersList;
