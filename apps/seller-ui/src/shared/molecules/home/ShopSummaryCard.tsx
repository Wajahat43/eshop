import React from 'react';
import { AvatarWithText, InfoRow, StatusBadge } from '../../atoms/home';

type ShopSummaryCardProps = {
  name?: string;
  category?: string;
  rating?: number;
  address?: string;
  avatarUrl?: string | null;
  totalProducts: number;
  activeOffers: number;
  eventsCount: number;
};

const ShopSummaryCard: React.FC<ShopSummaryCardProps> = ({
  name,
  category,
  rating,
  address,
  avatarUrl,
  totalProducts,
  activeOffers,
  eventsCount,
}) => {
  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground shadow p-4 md:p-5">
      <AvatarWithText
        src={avatarUrl || undefined}
        fallback={name?.[0]?.toUpperCase() || '?'}
        title={name || 'Your Shop'}
        subtitle={category || '—'}
      />
      <div className="mt-4 space-y-2">
        {rating !== undefined ? (
          <InfoRow label="Rating" value={<span className="font-medium">{rating.toFixed(1)}</span>} />
        ) : null}
        {address ? <InfoRow label="Address" value={<span className="truncate max-w-[240px]">{address}</span>} /> : null}
        <div className="flex items-center gap-2 text-sm">
          <StatusBadge label={`${totalProducts} products`} status="info" />
          <StatusBadge label={`${activeOffers} offers`} status="success" />
          <StatusBadge label={`${eventsCount} events`} status="warning" />
        </div>
      </div>
    </div>
  );
};

export default ShopSummaryCard;
