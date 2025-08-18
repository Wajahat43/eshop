import React from 'react';
import { PriceSlider } from '../../atoms';
import { FilterGroup } from '../../molecules';

interface ProductFiltersProps {
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  selectedSizes: string[];
  onSizesChange: (sizes: string[]) => void;
  selectedColors: string[];
  onColorsChange: (colors: string[]) => void;
  categories: Array<{ id: string; label: string; value: string }>;
  sizes: Array<{ id: string; label: string; value: string }>;
  colors: Array<{ id: string; label: string; value: string }>;
  disabled?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  priceRange,
  onPriceRangeChange,
  selectedCategories,
  onCategoriesChange,
  selectedSizes,
  onSizesChange,
  selectedColors,
  onColorsChange,
  categories,
  sizes,
  colors,
  disabled = false,
  minPrice,
  maxPrice,
}) => {
  return (
    <div className="w-64 bg-card p-6 rounded-lg shadow-sm border border-border space-y-6">
      <h2 className="text-xl font-bold text-foreground mb-6">Filters</h2>

      {/* Price Range Filter */}
      <div className="border-b border-border pb-6">
        <PriceSlider
          minPrice={minPrice || 0}
          maxPrice={maxPrice || 100000}
          value={priceRange}
          onChange={onPriceRangeChange}
          disabled={disabled}
        />
      </div>

      {/* Categories Filter */}
      <div className="border-b border-border pb-6">
        <FilterGroup
          title="Categories"
          options={categories}
          selectedValues={selectedCategories}
          onSelectionChange={onCategoriesChange}
          disabled={disabled}
        />
      </div>

      {/* Sizes Filter */}
      <div className="border-b border-border pb-6">
        <FilterGroup
          title="Sizes"
          options={sizes}
          selectedValues={selectedSizes}
          onSelectionChange={onSizesChange}
          disabled={disabled}
        />
      </div>

      {/* Colors Filter */}
      <div className="pb-6">
        <FilterGroup
          title="Colors"
          options={colors}
          selectedValues={selectedColors}
          onSelectionChange={onColorsChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default ProductFilters;
