'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Ratings from '../molecules/ratings';
import { Eye, Heart, ShoppingBag } from 'lucide-react';
import { ProductDetailsCard } from '../molecules';
import { useStore } from 'apps/user-ui/src/store';
import useUser from 'apps/user-ui/src/hooks/userUser';
import useLocationTracking from 'apps/user-ui/src/hooks/useLocationTracking';
import useDeviceTracking from 'apps/user-ui/src/hooks/useDeviceTracking';

interface ProductCardProps {
  product: any;
  isEvent?: boolean;
}

const ProductCard = ({ product, isEvent = false }: ProductCardProps) => {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const user = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const addToCart = useStore((state) => state.addToCart);
  const addToWishlist = useStore((state) => state.addToWishlist);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);
  const wishlist = useStore((state) => state.wishlist);
  const cart = useStore((state) => state.cart);

  const isInWishlist = wishlist.some((item) => item.id === product.id);
  const isInCart = cart.some((item) => item.id === product.id);

  useEffect(() => {
    if (!isEvent || !product?.ending_date) return;
    const interval = setInterval(() => {
      const endTime = new Date(product.ending_date).getTime();
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft('Expired');
        return;
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        setTimeLeft(`${days}d ${hours}h ${minutes}m left with this price.`);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  console.log('Product component rendered');

  return (
    <>
      <div className="group w-full min-h-[350px] h-max bg-card rounded-lg relative border border-border shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-102 overflow-hidden">
        {/* Badge Container */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        {isEvent && (
          <div className="bg-destructive text-destructive-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
            OFFER
          </div>
        )}
        {product?.stock <= 5 && (
          <div className="bg-yellow-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
            Limited Stock
          </div>
        )}
      </div>

      {/* Image Container */}
      <div className="relative overflow-hidden">
        <Link href={`/product/${product?.slug}`}>
          <Image
            src={product?.images[0]?.url || '/images/placeholder.png'}
            alt={product?.title}
            className="w-full object-cover h-[220px] mx-auto transition-transform duration-300 group-hover:scale-105"
            width={300}
            height={300}
          />
        </Link>

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
      </div>

      {/* Content Container */}
      <div className="p-4 space-y-2">
        {/* Shop Name */}
        <Link href={`/shop/${product?.Shop?.id}`}>
          <div className="text-primary text-sm font-medium hover:text-primary/80 transition-colors duration-200">
            {product?.Shop?.name}
          </div>
        </Link>

        {/* Product Title */}
        <Link href={`/product/${product?.slug}`}>
          <h3 className="text-base font-semibold text-foreground hover:text-primary transition-colors duration-200 line-clamp-2">
            {product?.title}
          </h3>
        </Link>

        {/* Ratings */}
        <div className="flex items-center">
          <Ratings rating={product?.rating} />
        </div>

        {/* Price and Sales */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">${product?.sale_price}</span>
            <span className="text-sm line-through text-muted-foreground">${product?.regular_price}</span>
          </div>
          <span className="text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">
            {product?.totalSales} Sold
          </span>
        </div>

        {/* Event Timer */}
        {isEvent && timeLeft && (
          <div>
            <span className="inline-block text-xs bg-orange-100 text-orange-600 px-3 py-1.5 rounded-full font-medium">
              {timeLeft}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute z-10 flex flex-col gap-2 right-3 top-16">
        <div className="bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110">
          <Heart
            className="cursor-pointer text-red-500 hover:text-red-600 transition-colors duration-200"
            size={20}
            fill={isInWishlist ? 'red' : 'bg-gray-tra'}
            stroke={isInWishlist ? 'red' : 'transparent'}
            onClick={() => {
              isInWishlist
                ? removeFromWishlist(product.id, user, location, deviceInfo)
                : addToWishlist({ ...product, quantity: 1 }, user, location, deviceInfo);
            }}
          />
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110">
          <Eye
            className="cursor-pointer text-muted-foreground  transition-colors duration-200"
            size={20}
            onClick={() => setOpen(!open)}
          />
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110">
          <ShoppingBag
            className="cursor-pointer text-muted-foreground  transition-colors duration-200"
            size={20}
            onClick={() => {
              isInCart
                ? removeFromCart(product.id, user, location, deviceInfo)
                : addToCart({ ...product, quantity: 1 }, user, location, deviceInfo);
            }}
          />
        </div>
      </div>

      </div>
      {/* Quick View Modal */}
      {open && <ProductDetailsCard product={product} setOpen={setOpen} />}
    </>
  );
};

export default ProductCard;
