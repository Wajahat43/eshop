'use client';
import React from 'react';
import { FilterGroup } from '../../molecules';

interface ShopFiltersProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  selectedCountries: string[];
  onCountriesChange: (countries: string[]) => void;
  categories: Array<{ id: string; label: string; value: string }>;
  countries: Array<{ code: string; name: string }>;
  disabled?: boolean;
}

const ShopFilters = ({
  selectedCategories,
  onCategoriesChange,
  selectedCountries,
  onCountriesChange,
  categories,
  countries,
  disabled = false,
}: ShopFiltersProps) => {
  // Transform countries data for FilterGroup
  const countryOptions = countries.map((country) => ({
    id: country.code,
    label: country.name,
    value: country.code,
  }));

  return (
    <div className="w-64 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Filters</h3>

        {/* Categories Filter */}
        <div className="mb-6">
          <FilterGroup
            title="Categories"
            options={categories}
            selectedValues={selectedCategories}
            onSelectionChange={onCategoriesChange}
            disabled={disabled}
          />
        </div>

        {/* Countries Filter */}
        <div className="mb-6">
          <FilterGroup
            title="Countries"
            options={countryOptions}
            selectedValues={selectedCountries}
            onSelectionChange={onCountriesChange}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

export default ShopFilters;
