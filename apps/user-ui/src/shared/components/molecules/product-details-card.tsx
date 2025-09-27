'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { Dialog } from 'packages/components/dialog';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';
import Ratings from './ratings';
import { MapPin, MessageCircle, X, ShoppingCart, Heart, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from 'apps/user-ui/src/store';
import useUser from 'apps/user-ui/src/hooks/userUser';
import useLocationTracking from 'apps/user-ui/src/hooks/useLocationTracking';
import useDeviceTracking from 'apps/user-ui/src/hooks/useDeviceTracking';
import { useCreateConversation } from 'apps/user-ui/src/hooks/chat';

interface ProductDetailsCardProps {
  product: any;
  setOpen: (open: boolean) => void;
}

const ProductDetailsCard = ({ product, setOpen }: ProductDetailsCardProps) => {
  const [activeImage, setActiveImage] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<string>(product?.colors[0] || '');
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes[0] || '');
  const [quantity, setQuantity] = useState<number>(1);

  const router = useRouter();
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const createConversationMutation = useCreateConversation();

  const addToCart = useStore((state) => state.addToCart);
  const addToWishlist = useStore((state) => state.addToWishlist);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);
  const wishlist = useStore((state) => state.wishlist);
  const cart = useStore((state) => state.cart);

  const isInWishlist = wishlist.some((item) => item.id === product.id);
  const isInCart = cart.some((item) => item.id === product.id);

  console.log('Product Details Card rendered');

  return (
    <Dialog isOpen={true} onClose={() => setOpen(false)} title="Product Details" size="6xl">
      <div className="w-full flex flex-col lg:flex-row gap-8 p-6 bg-background">
        {/* Image Gallery Section */}
        <div className="w-full lg:w-1/2 space-y-6">
          {/* Main Image */}
          <div className="relative group">
            <div className="aspect-square bg-muted rounded-xl overflow-hidden shadow-lg">
              <Image
                src={product?.images?.[activeImage || 0]?.url || '/placeholder-image.jpg'}
                alt={product?.title}
                width={500}
                height={500}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Action Buttons Overlay */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                <Heart size={18} className="text-muted-foreground hover:text-destructive" />
              </button>
              <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                <Share2 size={18} className="text-muted-foreground hover:text-primary" />
              </button>
            </div>
          </div>

          {/* Thumbnails */}
          {product?.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product?.images.map((image: any, index: number) => (
                <button
                  key={index}
                  className={twMerge(
                    'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:shadow-md',
                    activeImage === index
                      ? 'border-primary shadow-md ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50',
                  )}
                  onClick={() => setActiveImage(index)}
                >
                  <Image
                    src={image?.url || '/placeholder-image.jpg'}
                    alt={`${product?.title} - ${index + 1} thumbnail image`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="w-full lg:w-1/2 space-y-6">
          {/* Seller Information */}
          <div className="bg-card rounded-xl p-4 border shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <Link href={`/shop/${product?.shop?.id}`} className="group block">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {product?.shop?.name}
                  </h3>
                  {product?.shop?.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{product?.shop?.bio}</p>
                  )}
                </Link>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Ratings rating={product?.shop?.ratings} />
                    <span className="text-muted-foreground">({product?.shop?.ratings || 0})</span>
                  </div>

                  {product?.shop?.address && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin size={16} />
                      <span className="truncate">{product?.shop?.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={createConversationMutation.isPending}
                onClick={async () => {
                  if (!product?.shop?.id) return;

                  try {
                    const result = await createConversationMutation.mutateAsync({
                      sellerId: product.shop.sellerId,
                    });
                    // Redirect to inbox with conversation ID for more reliable navigation
                    router.push(`/inbox?conversationId=${result.conversation.id}`);
                  } catch (error) {
                    console.error('Failed to create conversation:', error);
                    // You might want to show a toast notification here
                  }
                }}
              >
                <MessageCircle size={16} />
                <span className="text-sm font-medium">
                  {createConversationMutation.isPending ? 'Creating Chat...' : 'Chat'}
                </span>
              </button>
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground leading-tight">{product?.title}</h1>
              {product?.short_description && (
                <p className="text-muted-foreground mt-2 leading-relaxed">{product?.short_description}</p>
              )}
            </div>

            {/* Brand */}
            {product?.brand && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Brand:</span>
                <span className="text-sm bg-muted px-3 py-1 rounded-full">{product?.brand}</span>
              </div>
            )}

            {/* Price Section */}
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

          {/* Color and Size Selections */}
          <div className="space-y-6">
            {/* Color Selection */}
            {product?.colors?.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Color</span>
                  <span className="text-sm text-muted-foreground">{selectedColor}</span>
                </div>
                <div className="flex gap-3">
                  {product?.colors.map((color: string) => (
                    <button
                      key={color}
                      className={twMerge(
                        'w-12 h-12 rounded-full border-2 transition-all duration-200 hover:scale-110 shadow-sm',
                        selectedColor === color
                          ? 'border-primary ring-2 ring-primary/20 shadow-md'
                          : 'border-border hover:border-primary/50',
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product?.sizes?.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Size</span>
                  <span className="text-sm text-muted-foreground">{selectedSize}</span>
                </div>
                <div className="flex gap-3">
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
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02]"
              onClick={() => {
                isInCart
                  ? removeFromCart(product.id, user, location, deviceInfo)
                  : addToCart({ ...product, quantity: 1 }, user, location, deviceInfo);
              }}
            >
              <ShoppingCart size={20} />
              {isInCart ? 'Remove from Cart' : 'Add to Cart'}
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground py-3 px-6 rounded-lg font-medium hover:bg-secondary/80 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02]"
              onClick={() => {
                isInWishlist
                  ? removeFromWishlist(product.id, user, location, deviceInfo)
                  : addToWishlist({ ...product, quantity: 1 }, user, location, deviceInfo);
              }}
            >
              <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
              {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          </div>

          {/* Additional Info */}
          <div className="pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>In Stock</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Free Shipping</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ProductDetailsCard;
