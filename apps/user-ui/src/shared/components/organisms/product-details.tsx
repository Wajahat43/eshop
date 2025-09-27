'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { ChevronLeft, ChevronRight, ShoppingCart, Heart, Share2, MapPin, MessageCircle } from 'lucide-react';
import ReactImageMagnify from 'react-image-magnify';
import Ratings from '../molecules/ratings';
import { useStore } from 'apps/user-ui/src/store';
import useUser from 'apps/user-ui/src/hooks/userUser';
import useLocationTracking from 'apps/user-ui/src/hooks/useLocationTracking';
import useDeviceTracking from 'apps/user-ui/src/hooks/useDeviceTracking';

interface ProductDetailsProps {
  product: any;
}

const ProductDetails = ({ product }: ProductDetailsProps) => {
  // States for image management
  const [currentImage, setCurrentImage] = useState<number>(0);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState<number>(0);

  // States for product selection
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes?.[0] || '');
  const [quantity, setQuantity] = useState<number>(1);

  // Hooks
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  // Store actions
  const addToCart = useStore((state) => state.addToCart);
  const addToWishlist = useStore((state) => state.addToWishlist);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);
  const wishlist = useStore((state) => state.wishlist);
  const cart = useStore((state) => state.cart);

  const isInWishlist = wishlist.some((item) => item.id === product.id);
  const isInCart = cart.some((item) => item.id === product.id);

  // Thumbnail navigation
  const maxVisibleThumbnails = 4;
  const totalImages = product?.images?.length || 0;
  const canNavigateLeft = thumbnailStartIndex > 0;
  const canNavigateRight = thumbnailStartIndex + maxVisibleThumbnails < totalImages;

  const navigateThumbnails = (direction: 'left' | 'right') => {
    if (direction === 'left' && canNavigateLeft) {
      setThumbnailStartIndex(Math.max(0, thumbnailStartIndex - 1));
    } else if (direction === 'right' && canNavigateRight) {
      setThumbnailStartIndex(Math.min(totalImages - maxVisibleThumbnails, thumbnailStartIndex + 1));
    }
  };

  const visibleThumbnails =
    product?.images?.slice(thumbnailStartIndex, thumbnailStartIndex + maxVisibleThumbnails) || [];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div id="magnify-portal" className="fixed top-1/2 right-5 -translate-y-1/2 z-[9999] pointer-events-none" />
      <div className="bg-card rounded-xl border shadow-lg p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* First Column - Image Gallery */}
          <div className="lg:col-span-1 space-y-6">
            {/* Main Image with ReactMagnifyImage */}
            <div className="relative group w-full">
              <ReactImageMagnify
                {...{
                  smallImage: {
                    alt: product?.title,
                    isFluidWidth: true,
                    src: product?.images?.[currentImage]?.url || '/placeholder-image.jpg',
                  },
                  largeImage: {
                    alt: product?.title,
                    src: product?.images?.[currentImage]?.url || '/placeholder-image.jpg',
                    width: 1200,
                    height: 1200,
                  },
                  enlargedImageContainerDimensions: {
                    width: '150%',
                    height: '150%',
                  },
                  enlargedImageContainerStyle: {
                    border: 'none',
                    boxShadow: 'none',
                  },
                  enlargedImagePosition: 'right',
                }}
              />

              {/* Action Buttons Overlay */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                  <Heart
                    size={18}
                    className={twMerge(
                      'transition-colors',
                      isInWishlist
                        ? 'text-destructive fill-destructive'
                        : 'text-muted-foreground hover:text-destructive',
                    )}
                    onClick={() => {
                      isInWishlist
                        ? removeFromWishlist(product.id, user, location, deviceInfo)
                        : addToWishlist({ ...product, quantity: 1 }, user, location, deviceInfo);
                    }}
                  />
                </button>
                <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                  <Share2 size={18} className="text-muted-foreground hover:text-primary" />
                </button>
              </div>
            </div>

            {/* Thumbnails with Navigation */}
            {totalImages > 1 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">Product Images</h4>
                  {totalImages > maxVisibleThumbnails && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigateThumbnails('left')}
                        disabled={!canNavigateLeft}
                        className={twMerge(
                          'p-1 rounded-md transition-colors',
                          canNavigateLeft
                            ? 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            : 'text-muted-foreground/50 cursor-not-allowed',
                        )}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => navigateThumbnails('right')}
                        disabled={!canNavigateRight}
                        className={twMerge(
                          'p-1 rounded-md transition-colors',
                          canNavigateRight
                            ? 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            : 'text-muted-foreground/50 cursor-not-allowed',
                        )}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2">
                  {visibleThumbnails.map((image: any, index: number) => {
                    const actualIndex = thumbnailStartIndex + index;
                    return (
                      <button
                        key={actualIndex}
                        className={twMerge(
                          'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:shadow-md',
                          currentImage === actualIndex
                            ? 'border-primary shadow-md ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50',
                        )}
                        onClick={() => setCurrentImage(actualIndex)}
                      >
                        <Image
                          src={image?.url}
                          alt={`${product?.title} - ${actualIndex + 1} thumbnail image`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Second Column - Product Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Rating and Reviews */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Ratings rating={product?.rating || 0} />
                <a href="#reviews" className="text-sm text-primary hover:text-primary/80 transition-colors underline">
                  ({product?.reviews?.length || 0} Reviews)
                </a>
              </div>

              {/* Brand */}
              {product?.brand && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Brand:</span>
                  <span className="text-sm bg-muted px-3 py-1 rounded-full text-foreground">{product?.brand}</span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Price Information */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">${product?.sale_price}</span>
                {product?.regular_price && product?.regular_price !== product?.sale_price && (
                  <span className="text-lg text-muted-foreground line-through">${product?.regular_price}</span>
                )}
                {product?.regular_price && product?.regular_price !== product?.sale_price && (
                  <span className="text-sm bg-destructive/10 text-destructive px-2 py-1 rounded-md font-medium">
                    {Math.round(((product?.regular_price - product?.sale_price) / product?.regular_price) * 100)}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Size Selector */}
            {product?.sizes?.length > 0 && (
              <div className="space-y-3">
                <span className="text-sm font-medium text-foreground">Size</span>
                <div className="flex gap-3 flex-wrap">
                  {product?.sizes.map((size: string) => (
                    <button
                      key={size}
                      className={twMerge(
                        'px-4 py-2 rounded-lg border-2 transition-all duration-200 hover:scale-105 text-sm font-medium',
                        selectedSize === size
                          ? 'border-primary bg-primary text-primary-foreground shadow-md'
                          : 'border-border text-foreground hover:border-primary/50 hover:bg-muted',
                      )}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-foreground">Quantity</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    className="w-10 h-10 flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors text-foreground"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <span className="text-lg font-medium">−</span>
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center text-foreground font-medium border-x border-border">
                    {quantity}
                  </span>
                  <button
                    className="w-10 h-10 flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors text-foreground"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <span className="text-lg font-medium">+</span>
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {quantity} × ${product?.sale_price} = ${(quantity * product?.sale_price).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02]"
              onClick={() => {
                isInCart
                  ? removeFromCart(product.id, user, location, deviceInfo)
                  : addToCart({ ...product, quantity, selectedSize }, user, location, deviceInfo);
              }}
            >
              <ShoppingCart size={20} />
              {isInCart ? 'Remove from Cart' : 'Add to Cart'}
            </button>
          </div>

          {/* Third Column - Seller Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Seller Card */}
            <div className="bg-card rounded-xl p-6 border shadow-sm">
              <div className="space-y-4">
                {/* Shop Name and Bio */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">{product?.shop?.name || 'Shop Name'}</h3>
                  {product?.shop?.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{product?.shop?.bio}</p>
                  )}
                </div>

                {/* Shop Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-foreground">88%</div>
                    <div className="text-xs text-muted-foreground">Positive Ratings</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-foreground">100%</div>
                    <div className="text-xs text-muted-foreground">Ship on Time</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-foreground">100%</div>
                    <div className="text-xs text-muted-foreground">Chat Response</div>
                  </div>
                </div>

                {/* Location */}
                {product?.shop?.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin size={16} />
                    <span className="truncate">{product?.shop?.address}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                    <MessageCircle size={16} />
                    Chat Now
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground py-2 px-4 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
                    Go to Store
                  </button>
                </div>
              </div>
            </div>

            {/* Delivery & Warranty Info */}
            <div className="bg-card rounded-xl p-6 border shadow-sm space-y-4">
              <h4 className="font-medium text-foreground">Delivery & Returns</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-muted-foreground">Free Shipping</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-xs">7</span>
                  </div>
                  <span className="text-muted-foreground">7 Days Returns</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-xs">!</span>
                  </div>
                  <span className="text-muted-foreground">Warranty not available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
