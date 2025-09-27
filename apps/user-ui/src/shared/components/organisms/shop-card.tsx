'use client';
import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
import { MapPin, ShoppingBag } from 'lucide-react';
import Ratings from '../molecules/ratings';

interface ShopCardProps {
  shop: {
    id: string;
    name: string;
    bio?: string;
    category?: string;
    coverBanner?: string;
    address?: string;
    ratings?: number;
    products?: Array<{
      id: string;
      title: string;
      images: Array<{ url: string; file_id: string }>;
    }>;
    createdAt?: string;
    updatedAt?: string;
  };
}

const ShopCard = ({ shop }: ShopCardProps) => {
  return (
    <div className="group w-full min-h-[300px] h-max bg-card rounded-lg relative border border-border shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-102 overflow-hidden">
      {/* Banner Image */}
      <div className="relative overflow-hidden h-32">
        <Image
          src={shop?.coverBanner || '/images/shop-banner-placeholder.svg'}
          alt={`${shop.name} banner`}
          className="w-full object-cover h-full transition-transform duration-300 group-hover:scale-105"
          width={400}
          height={128}
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
      </div>

      {/* Logo - Using first product image as logo placeholder */}
      <div className="absolute top-20 left-4 z-10">
        <div className="w-16 h-16 bg-card rounded-full border-4 border-background shadow-lg overflow-hidden">
          <Image
            src={shop?.products?.[0]?.images?.[0]?.url || '/images/shop-logo-placeholder.svg'}
            alt={`${shop.name} logo`}
            className="w-full h-full object-cover"
            width={64}
            height={64}
          />
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 pt-8 space-y-3">
        {/* Shop Name */}
        <Link href={`/shop/${shop.id}`}>
          <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors duration-200 line-clamp-1">
            {shop.name}
          </h3>
        </Link>

        {/* Description */}
        {shop.bio && <p className="text-sm text-muted-foreground line-clamp-2">{shop.bio}</p>}

        {/* Location */}
        {shop.address && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{shop.address}</span>
          </div>
        )}

        {/* Rating */}
        {shop.ratings !== null && shop.ratings !== undefined ? (
          <Ratings rating={shop.ratings} size={16} showLabel={true} />
        ) : null}

        {/* Category */}
        {shop.category && (
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg capitalize hover:bg-primary/15 transition-colors duration-200">
              {shop.category}
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShoppingBag className="w-4 h-4" />
            <span>{shop.products?.length || 0} product(s)</span>
          </div>

          <Link href={`/shop/${shop.id}`}>
            <button className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors duration-200">
              Visit Shop
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
