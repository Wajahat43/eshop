'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductFilters, ProductGrid, Pagination } from '../../../shared/components/organisms';
import useProducts from '../../../hooks/useProducts';
import useOffers from '../../../hooks/useOffers';
import useFilteredOffers from '../../../hooks/useFilteredOffers';

// Predefined colors and sizes
const PREDEFINED_COLORS = [
  { id: 'red', label: 'Red', value: 'red' },
  { id: 'blue', label: 'Blue', value: 'blue' },
  { id: 'green', label: 'Green', value: 'green' },
  { id: 'yellow', label: 'Yellow', value: 'yellow' },
  { id: 'black', label: 'Black', value: 'black' },
  { id: 'white', label: 'White', value: 'white' },
  { id: 'purple', label: 'Purple', value: 'purple' },
  { id: 'orange', label: 'Orange', value: 'orange' },
  { id: 'pink', label: 'Pink', value: 'pink' },
  { id: 'brown', label: 'Brown', value: 'brown' },
];

const PREDEFINED_SIZES = [
  { id: 'xs', label: 'XS', value: 'xs' },
  { id: 's', label: 'S', value: 's' },
  { id: 'm', label: 'M', value: 'm' },
  { id: 'l', label: 'L', value: 'l' },
  { id: 'xl', label: 'XL', value: 'xl' },
  { id: 'xxl', label: 'XXL', value: 'xxl' },
];

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([0, 100000]);

  // Debouncing for price range changes
  const priceRangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hooks
  const { getCategoriesQuery } = useProducts({ page, limit: 12 });
  const { getOffersQuery } = useOffers({ page, limit: 12 });

  // Convert arrays to comma-separated strings for API
  const categoriesString = selectedCategories.join(',');
  const sizesString = selectedSizes.join(',');
  const colorsString = selectedColors.join(',');
  const priceRangeString = `${tempPriceRange[0]}-${tempPriceRange[1]}`;

  // Check if any filters are applied
  const hasFilters =
    selectedCategories.length > 0 ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    tempPriceRange[0] !== 0 ||
    tempPriceRange[1] !== 100000;

  // Use offers query with filters
  const filteredOffersQuery = useFilteredOffers({
    priceRange: priceRangeString,
    categories: categoriesString,
    colors: colorsString,
    sizes: sizesString,
    page,
    limit: 12,
  });

  // Use filtered offers if filters are applied, otherwise use regular offers
  const activeQuery = hasFilters ? filteredOffersQuery : getOffersQuery;

  // Extract data with proper fallbacks
  const categories = getCategoriesQuery.data?.categories || [];

  // Handle different API response structures
  let offers = [];
  let totalPages = 1;

  if (activeQuery.data) {
    if (activeQuery.data.events) {
      // Filtered events response
      offers = activeQuery.data.events;
      totalPages = activeQuery.data.pagination?.totalPages || 1;
    } else if (activeQuery.data.data) {
      // Regular offers response
      offers = activeQuery.data.data;
      totalPages = activeQuery.data.totalPages || 1;
    } else if (Array.isArray(activeQuery.data)) {
      // Direct array response
      offers = activeQuery.data;
      totalPages = 1;
    }
  }

  // Calculate dynamic price range from actual offers
  const calculatePriceRange = () => {
    if (offers.length === 0) return [0, 100000];

    const prices = offers.map((p: any) => p.sale_price).filter((p: any) => p !== undefined && p !== null);
    if (prices.length === 0) return [0, 100000];

    const minPrice = Math.floor(Math.min(...prices) * 0.9); // 10% below min
    const maxPrice = Math.ceil(Math.max(...prices) * 1.1); // 10% above max

    return [Math.max(0, minPrice), Math.max(100000, maxPrice)];
  };

  const [dynamicMinPrice, dynamicMaxPrice] = calculatePriceRange();

  // Update price range when offers change (for dynamic range)
  useEffect(() => {
    if (offers.length > 0) {
      const [newMin, newMax] = calculatePriceRange();
      setPriceRange((prev) => [Math.max(prev[0], newMin), Math.min(prev[1], newMax)]);
      setTempPriceRange((prev) => [Math.max(prev[0], newMin), Math.min(prev[1], newMax)]);
    }
  }, [offers]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (priceRangeTimeoutRef.current) {
        clearTimeout(priceRangeTimeoutRef.current);
      }
    };
  }, []);

  const isLoading = activeQuery.isLoading;
  const error = activeQuery.error?.message || null;

  // URL state management without page reload
  useEffect(() => {
    const urlPriceRange = searchParams.get('priceRange');
    const urlCategories = searchParams.get('categories');
    const urlSizes = searchParams.get('sizes');
    const urlColors = searchParams.get('colors');
    const urlPage = searchParams.get('page');

    if (urlPriceRange) {
      const [min, max] = urlPriceRange.split('-').map(Number);
      setPriceRange([min, max]);
      setTempPriceRange([min, max]);
    }
    if (urlCategories) setSelectedCategories(urlCategories.split(',').filter(Boolean));
    if (urlSizes) setSelectedSizes(urlSizes.split(',').filter(Boolean));
    if (urlColors) setSelectedColors(urlColors.split(',').filter(Boolean));
    if (urlPage) setPage(Number(urlPage));
  }, [searchParams]);

  // Update URL without page reload using replaceState
  const updateURL = useCallback(
    (newFilters: any) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newFilters.priceRange) {
        params.set('priceRange', `${newFilters.priceRange[0]}-${newFilters.priceRange[1]}`);
      }
      if (newFilters.categories) {
        params.set('categories', newFilters.categories.join(','));
      }
      if (newFilters.sizes) {
        params.set('sizes', newFilters.sizes.join(','));
      }
      if (newFilters.colors) {
        params.set('colors', newFilters.colors.join(','));
      }
      if (newFilters.page) {
        params.set('page', newFilters.page.toString());
      }

      // Use replaceState to avoid page reload and maintain scroll position
      const newUrl = `/offers?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    },
    [searchParams],
  );

  // Filter change handlers
  const handlePriceRangeChange = (range: [number, number]) => {
    setTempPriceRange(range);

    // Clear existing timeout
    if (priceRangeTimeoutRef.current) {
      clearTimeout(priceRangeTimeoutRef.current);
    }

    // Debounce the URL update by 500ms
    priceRangeTimeoutRef.current = setTimeout(() => {
      updateURL({ priceRange: range, page: 1 });
      setPage(1);
    }, 500);
  };

  const handleCategoriesChange = (categories: string[]) => {
    setSelectedCategories(categories);
    updateURL({ categories, page: 1 });
    setPage(1);
  };

  const handleSizesChange = (sizes: string[]) => {
    setSelectedSizes(sizes);
    updateURL({ sizes, page: 1 });
    setPage(1);
  };

  const handleColorsChange = (colors: string[]) => {
    setSelectedColors(colors);
    updateURL({ colors, page: 1 });
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateURL({ page: newPage });
  };

  // Transform categories data for FilterGroup
  const categoryOptions = categories.map((cat: any) => ({
    id: cat,
    label: cat,
    value: cat,
  }));

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Special Offers & Events</h1>
          <p className="mt-2 text-muted-foreground">Discover amazing deals and limited-time offers</p>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar - Filters */}
          <div className="flex-shrink-0">
            <ProductFilters
              priceRange={tempPriceRange}
              onPriceRangeChange={handlePriceRangeChange}
              selectedCategories={selectedCategories}
              onCategoriesChange={handleCategoriesChange}
              selectedSizes={selectedSizes}
              onSizesChange={handleSizesChange}
              selectedColors={selectedColors}
              onColorsChange={handleColorsChange}
              categories={categoryOptions}
              sizes={PREDEFINED_SIZES}
              colors={PREDEFINED_COLORS}
              disabled={isLoading}
              minPrice={dynamicMinPrice}
              maxPrice={dynamicMaxPrice}
            />
          </div>

          {/* Right Side - Offers and Pagination */}
          <div className="flex-1">
            {/* Debug section - remove this later */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-semibold text-blue-800 mb-2">Offers Info:</h3>
              <p className="text-sm text-blue-700">Offers count: {offers.length}</p>
              <p className="text-sm text-blue-700">Has filters: {hasFilters ? 'Yes' : 'No'}</p>
              <p className="text-sm text-blue-700">
                Dynamic price range: ${dynamicMinPrice.toLocaleString()} - ${dynamicMaxPrice.toLocaleString()}
              </p>
              <p className="text-sm text-blue-700">
                Current price range: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
              </p>
              <p className="text-sm text-blue-700">Active query data: {JSON.stringify(activeQuery.data, null, 2)}</p>
            </div>

            <ProductGrid products={offers} loading={isLoading} error={error} />

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
