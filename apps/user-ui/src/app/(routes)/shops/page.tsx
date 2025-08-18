'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShopFilters, ShopGrid, Pagination } from '../../../shared/components/organisms';
import useShops from '../../../hooks/useShops';
import useFilteredShops from '../../../hooks/useFilteredShops';
import countries from '../../../utils/countries';
import { shopCategories } from '../../../utils/shopCategories';

const Page = () => {
  const searchParams = useSearchParams();

  // State management
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  // Hooks
  const getShopsQuery = useShops({ page, limit: 12 });

  // Convert arrays to comma-separated strings for API
  const categoriesString = selectedCategories.join(',');
  const countriesString = selectedCountries.join(',');

  // Check if any filters are applied
  const hasFilters = selectedCategories.length > 0 || selectedCountries.length > 0;

  // Use filtered shops query with filters
  const filteredShopsQuery = useFilteredShops({
    categories: categoriesString,
    countries: countriesString,
    page,
    limit: 12,
  });

  // Extract data with proper fallbacks
  const categories = shopCategories;

  // Handle different API response structures
  let shops = [];
  let totalPages = 1;

  if (hasFilters) {
    // Use filtered shops
    if (filteredShopsQuery.data) {
      if (filteredShopsQuery.data.shops) {
        shops = filteredShopsQuery.data.shops;
        totalPages = filteredShopsQuery.data.pagination?.totalPages || 1;
      } else if (filteredShopsQuery.data.data) {
        shops = filteredShopsQuery.data.data;
        totalPages = filteredShopsQuery.data.totalPages || 1;
      } else if (Array.isArray(filteredShopsQuery.data)) {
        shops = filteredShopsQuery.data;
        totalPages = 1;
      }
    }
  } else {
    // Use regular shops - handle the nested structure
    if (getShopsQuery.data) {
      if (getShopsQuery.data.shops) {
        shops = getShopsQuery.data.shops;
        totalPages = getShopsQuery.data.pagination?.totalPages || 1;
      } else if (getShopsQuery.data.data) {
        shops = getShopsQuery.data.data;
        totalPages = getShopsQuery.data.totalPages || 1;
      } else if (Array.isArray(getShopsQuery.data)) {
        shops = getShopsQuery.data;
        totalPages = 1;
      } else if (getShopsQuery.data.success && Array.isArray(getShopsQuery.data.shops)) {
        // Handle the success response structure
        shops = getShopsQuery.data.shops;
        totalPages = getShopsQuery.data.pagination?.totalPages || 1;
      }
    }
  }

  const isLoading = hasFilters ? filteredShopsQuery.isLoading : getShopsQuery.isLoading;
  const error = hasFilters ? filteredShopsQuery.error?.message || null : getShopsQuery.error?.message || null;

  // URL state management without page reload
  useEffect(() => {
    const urlCategories = searchParams.get('categories');
    const urlCountries = searchParams.get('countries');
    const urlPage = searchParams.get('page');

    if (urlCategories) setSelectedCategories(urlCategories.split(',').filter(Boolean));
    if (urlCountries) setSelectedCountries(urlCountries.split(',').filter(Boolean));
    if (urlPage) setPage(Number(urlPage));
  }, [searchParams]);

  // Update URL without page reload using replaceState
  const updateURL = useCallback(
    (newFilters: any) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newFilters.categories) {
        params.set('categories', newFilters.categories.join(','));
      }
      if (newFilters.countries) {
        params.set('countries', newFilters.countries.join(','));
      }
      if (newFilters.page) {
        params.set('page', newFilters.page.toString());
      }

      // Use replaceState to avoid page reload and maintain scroll position
      const newUrl = `/shops?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    },
    [searchParams],
  );

  // Filter change handlers
  const handleCategoriesChange = (categories: string[]) => {
    setSelectedCategories(categories);
    updateURL({ categories, page: 1 });
    setPage(1);
  };

  const handleCountriesChange = (countries: string[]) => {
    setSelectedCountries(countries);
    updateURL({ countries, page: 1 });
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateURL({ page: newPage });
  };

  // Transform categories data for FilterGroup
  const categoryOptions = categories.map((cat) => ({
    id: cat.value,
    label: cat.label,
    value: cat.value,
  }));

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Shops</h1>
          <p className="mt-2 text-muted-foreground">Discover amazing shops and their products</p>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar - Filters */}
          <div className="flex-shrink-0">
            <ShopFilters
              selectedCategories={selectedCategories}
              onCategoriesChange={handleCategoriesChange}
              selectedCountries={selectedCountries}
              onCountriesChange={handleCountriesChange}
              categories={categoryOptions}
              countries={countries}
              disabled={isLoading}
            />
          </div>

          {/* Right Side - Shops and Pagination */}
          <div className="flex-1">
            <ShopGrid shops={shops} loading={isLoading} error={error} />

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
