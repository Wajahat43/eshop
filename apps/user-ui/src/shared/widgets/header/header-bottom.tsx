'use client';

import React from 'react';
import { navItems } from 'apps/user-ui/src/configs/constants';
import Link from 'next/link';
import ActionItems from './action-items';
import { twMerge } from 'tailwind-merge';

const HeaderBottom = () => {
  const [isSticky, setIsSticky] = React.useState(false);
  const scrollThreshold = 100;
  const buffer = 1; // Buffer to prevent flickering around threshold

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
          ? 'fixed top-0 left-0 z-[100] h-12 bg-background/80 backdrop-blur-md border-b border-border/60 shadow-lg'
          : 'relative',
      )}
    >
      <div
        className={twMerge('relative m-auto flex w-[80%] items-center justify-between', isSticky ? 'py-1.5' : 'py-2')}
      >
        {/** Navigation Links */}
        <div className="flex items-center gap-6">
          {navItems.map((item, index) => {
            const isExternalLink = item.href.startsWith('http');
            return isExternalLink ? (
              <a
                className="px-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
                key={index}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.title}
              </a>
            ) : (
              <Link
                className="px-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
                key={index}
                href={item.href}
              >
                {item.title}
              </Link>
            );
          })}
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
