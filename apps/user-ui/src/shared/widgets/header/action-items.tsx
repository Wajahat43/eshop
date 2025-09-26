'use client';
import React from 'react';
import Link from 'next/link';
import { Heart, User, ShoppingCart } from 'lucide-react';
import useUser from 'apps/user-ui/src/hooks/userUser';
import { Spinner } from '../../components/spinner';
import { useStore } from 'apps/user-ui/src/store';

const ActionItems = () => {
  const { user, isLoading } = useUser();

  const wishlist = useStore((state) => state.wishlist);
  const cart = useStore((state) => state.cart);

  return (
    <div className="flex items-center gap-8">
      <div className="flex items-center gap-4">
        {/* User Profile Section */}
        <div className="w-[170px] h-[32px] flex items-center justify-center">
          {isLoading ? (
            <Spinner size="lg" />
          ) : user ? (
            <>
              <Link
                href={'/profile'}
                className="border-2 w-[32px] h-[32px] flex items-center justify-center rounded-full border-border mr-2"
              >
                <User size={18} />
              </Link>
              <Link href={'/profile'}>
                <span className="font-medium text-sm">Hello, </span>
                <span className="font-semibold text-sm">{`${user.name}`}</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href={'/login'}
                className="border-2 w-[32px] h-[32px] flex items-center justify-center rounded-full border-border mr-2"
              >
                <User size={18} />
              </Link>
              <div className="flex items-center gap-4">
                <Link href={'/login'}>
                  <span className="font-medium text-sm">Hello, </span>
                  <span className="font-semibold text-sm">Sign In</span>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-5">
          <Link href="/wishlist" className="relative">
            <Heart />
            <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
              <span className="text-white font-medium text-sm">{wishlist.length}</span>
            </div>
          </Link>
          <Link href="/cart" className="relative">
            <ShoppingCart />
            <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
              <span className="text-white font-medium text-sm">{cart.length}</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ActionItems;
