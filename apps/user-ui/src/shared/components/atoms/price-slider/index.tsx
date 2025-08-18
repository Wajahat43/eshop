import React from 'react';

interface PriceSliderProps {
  minPrice: number;
  maxPrice: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  disabled?: boolean;
}

const PriceSlider: React.FC<PriceSliderProps> = ({ minPrice, maxPrice, value, onChange, disabled = false }) => {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), value[1] - 1000);
    onChange([newMin, value[1]]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), value[0] + 1000);
    onChange([value[0], newMax]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Price Range</span>
        <span>
          ${value[0].toLocaleString()} - ${value[1].toLocaleString()}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex space-x-4">
          <div className="flex-1">
            <label htmlFor="min-price" className="block text-xs text-muted-foreground mb-1">
              Min Price
            </label>
            <input
              type="number"
              id="min-price"
              min={minPrice}
              max={value[1] - 1000}
              value={value[0]}
              onChange={handleMinChange}
              disabled={disabled}
              className="w-full px-3 py-2 border border-input rounded-md text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="max-price" className="block text-xs text-muted-foreground mb-1">
              Max Price
            </label>
            <input
              type="number"
              id="max-price"
              min={value[0] + 1000}
              max={maxPrice}
              value={value[1]}
              onChange={handleMaxChange}
              disabled={disabled}
              className="w-full px-3 py-2 border border-input rounded-md text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceSlider;
