import React from 'react';
import { AvatarWithText, InfoRow, StatusBadge } from '../../atoms/home';

type SellerHomeHeroProps = {
  bannerUrl?: string | null;
  avatarUrl?: string | null;
  name?: string;
  category?: string;
  address?: string;
  website?: string | null;
  rating?: number;
};

const SellerHomeHero: React.FC<SellerHomeHeroProps> = ({
  bannerUrl,
  avatarUrl,
  name,
  category,
  address,
  website,
  rating,
}) => {
  return (
    <section className="rounded-xl overflow-hidden border border-border bg-card text-card-foreground shadow">
      <div className="relative h-40 md:h-[24rem] bg-muted">
        {bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bannerUrl} alt="Shop banner" className="h-full w-full object-fit" />
        ) : null}
        <div className="absolute -bottom-6 left-4">
          <AvatarWithText
            src={avatarUrl || undefined}
            fallback={name?.[0]?.toUpperCase() || '?'}
            title={name || 'Your Shop'}
            subtitle={category || ''}
            className="drop-shadow"
          />
        </div>
      </div>
      <div className="pt-8 pb-4 px-4 md:px-5">
        <div className="flex flex-wrap items-center gap-3">
          {rating !== undefined ? <StatusBadge label={`Rating ${rating.toFixed(1)}`} status="success" /> : null}
          {website ? (
            <a href={website} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
              Visit website
            </a>
          ) : null}
        </div>
        {address ? (
          <div className="mt-3">
            <InfoRow label="Address" value={<span className="truncate">{address}</span>} />
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default SellerHomeHero;
