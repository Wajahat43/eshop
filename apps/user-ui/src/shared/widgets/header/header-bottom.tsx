'use client';

import React from 'react';
import { AlignLeft, ChevronDown } from 'lucide-react';
import { navItems } from 'apps/user-ui/src/configs/constants';
import Link from 'next/link';
import ActionItems from './action-items';
import { twMerge } from 'tailwind-merge';

const HeaderBottom = () => {
  const [show, setShow] = React.useState(false);
  const [isSticky, setIsSticky] = React.useState(false);
  const scrollThreshold = 100;
  const buffer = 20; // Buffer to prevent flickering around threshold

  //Track scroll position with throttling
  const handleScroll = React.useCallback(() => {
    const currentScrollY = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;

    // Don't handle scroll if there's not enough content to scroll
    if (documentHeight <= viewportHeight) {
      return;
    }

    // Only update state if we've crossed the threshold with buffer
    if (currentScrollY > scrollThreshold + buffer && !isSticky) {
      setIsSticky(true);
    } else if (currentScrollY < scrollThreshold - buffer && isSticky) {
      setIsSticky(false);
    }
  }, [isSticky]);

  React.useEffect(() => {
    let ticking = false;
    let isInitialized = false;

    // Small delay to prevent flickering on initial load
    const initTimer = setTimeout(() => {
      isInitialized = true;
    }, 100);

    const throttledScrollHandler = () => {
      if (!ticking && isInitialized) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    return () => {
      window.removeEventListener('scroll', throttledScrollHandler);
      clearTimeout(initTimer);
    };
  }, [handleScroll]);

  return (
    <div
      className={twMerge(
        'w-full transition-all duration-300 ease-out',
        isSticky
          ? 'fixed top-0 left-0 z-[100] h-20 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-lg'
          : 'relative',
      )}
    >
      <div className={twMerge('w-[80%] relative m-auto flex items-center justify-between', isSticky ? 'pt-3' : 'pt-0')}>
        {/**All Dropdowns */}
        <div
          className={twMerge(
            'w-[260px] cursor-pointer flex items-center justify-between px-5 h-[50px] bg-primary transition-all duration-300',
            isSticky && '-mb-2',
          )}
          onClick={() => setShow(!show)}
        >
          <div className="flex items-center gap-2">
            <AlignLeft />
            <span className="text-foreground font-medium">All Departments </span>
          </div>
          <ChevronDown />
        </div>

        {/**Dropdown menu */}
        {show && (
          <div
            className={twMerge(
              'absolute left-0 min-w-[260px] min-h-[400px] bg-muted/95 backdrop-blur-md text-muted-foreground border border-border/50 shadow-xl transition-all duration-300',
              isSticky ? 'top-[70px]' : 'top-[50px]',
            )}
          />
        )}

        {/** Navigation Links */}
        <div className="flex gap-8 items-center">
          {navItems.map((item, index) => (
            <Link className="px-2 font-medium text-lg" key={index} href={item.href}>
              {item.title}
            </Link>
          ))}
        </div>

        {/** Sticky Action Items - Always render but conditionally show */}
        <div
          className={twMerge(
            'transition-opacity duration-300',
            isSticky ? 'opacity-100' : 'opacity-0 pointer-events-none',
          )}
        >
          <ActionItems />
        </div>
      </div>
    </div>
  );
};

export default HeaderBottom;
