'use client';
import React from 'react';
import Link from 'next/link';
import { Heart, Search, User, ShoppingCart } from 'lucide-react';
import useUser from 'apps/user-ui/src/hooks/userUser';
import { Spinner } from '../../components/spinner';

const ActionItems = () => {
  const { user, isLoading } = useUser();

  return (
    <div className="flex items-center gap-8">
      <div className="flex items-center gap-4">
        <div className="w-[120px] h-[50px] flex items-center justify-center">
          {isLoading ? (
            <Spinner size="lg" />
          ) : user ? (
            <>
              <Link
                href={'/profile'}
                className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-border mr-2"
              >
                <User />
              </Link>
              <Link href={'/profile'}>
                <span className="block font-medium">Hello, </span>
                <span className="font-semibold">{`${user.name}`}</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href={'/login'}
                className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-border mr-2"
              >
                <User />
              </Link>
              <div className="flex items-center gap-4">
                <Link href={'/login'}>
                  <span className="block font-medium">Hello, </span>
                  <span className="font-semibold"> Sign In</span>
                </Link>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-5">
          <Link href="/wishlist" className="relative">
            <Heart />
            <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
              <span className="text-white font-medium text-sm">0</span>
            </div>
          </Link>
          <Link href="/cart" className="relative">
            <ShoppingCart />
            <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
              <span className="text-white font-medium text-sm">0</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ActionItems;
