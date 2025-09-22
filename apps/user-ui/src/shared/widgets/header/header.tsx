'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Search, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import HeaderBottom from './header-bottom';
import ActionItems from './action-items';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';

type SearchResult = {
  id: string;
  title: string;
  slug: string;
};

const useDebouncedValue = <T,>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const debouncedTerm = useDebouncedValue(searchTerm, 300);
  const trimmedQuery = debouncedTerm.trim();
  const hasDebouncedQuery = trimmedQuery.length >= 2;
  const hasInputQuery = searchTerm.trim().length >= 2;

  const { data: searchData, isFetching, isError } = useQuery({
    queryKey: ['search-products', trimmedQuery],
    queryFn: async () => {
      const response = await axiosInstance.get('/product/api/search-products', {
        params: { q: trimmedQuery },
      });
      return response.data;
    },
    enabled: hasDebouncedQuery,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const results = useMemo<SearchResult[]>(() => searchData?.products ?? [], [searchData]);
  const shouldShowResults = isFocused && (hasInputQuery || (isFetching && trimmedQuery.length >= 2) || isError);
  const showEmptyState = !isFetching && hasDebouncedQuery && results.length === 0;
  const showErrorState = isError && hasDebouncedQuery;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (results.length > 0) {
        router.push(`/product/${results[0].slug}`);
        setIsFocused(false);
      }
    },
    [results, router],
  );

  const handleResultClick = useCallback(() => {
    setIsFocused(false);
    setSearchTerm('');
  }, []);

  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto flex w-[80%] flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="flex items-center justify-between gap-4 md:justify-start">
          <Link href="/">
            <span className="text-2xl font-semibold tracking-tight">NextCart Logo</span>
          </Link>
          <div className="md:hidden">
            <ActionItems />
          </div>
        </div>

        <div ref={searchWrapperRef} className="relative w-full max-w-2xl">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 rounded-full border border-border/60 bg-card/90 px-4 py-2 shadow-sm backdrop-blur transition duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onFocus={() => setIsFocused(true)}
                placeholder="Search for drops, brands, and gear"
                className="h-11 w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-primary/20 transition-transform duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={!hasDebouncedQuery || results.length === 0}
                aria-label="Open first result"
              >
                {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Open'}
              </button>
            </div>
          </form>

          {shouldShowResults && (
            <div className="absolute left-0 right-0 top-full z-50 mt-3 rounded-3xl border border-border/60 bg-card/95 p-4 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between px-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Search results</p>
                {hasDebouncedQuery && !isFetching && (
                  <span className="text-xs text-muted-foreground">{results.length} matches</span>
                )}
              </div>
              <div className="mt-4 space-y-2">
                {isFetching && (
                  <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching products...
                  </div>
                )}

                {showEmptyState && (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-background/80 px-4 py-6 text-center text-sm text-muted-foreground">
                    No products found. Try another keyword.
                  </div>
                )}

                {showErrorState && (
                  <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive">
                    We couldn't complete that search. Please try again.
                  </div>
                )}

                {!isFetching && results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="flex items-center justify-between rounded-2xl border border-transparent bg-background/70 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10"
                    onClick={handleResultClick}
                  >
                    <span className="truncate">{product.title}</span>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">View</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:block">
          <ActionItems />
        </div>
      </div>
      <div className="border-b border-border">
        <HeaderBottom />
      </div>
    </div>
  );
};

export default Header;
