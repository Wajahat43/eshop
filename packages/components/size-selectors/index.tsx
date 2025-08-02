'use client';
import React from 'react';
import { Controller } from 'react-hook-form';
import { PlusIcon, CheckIcon, XIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

// Common size options for different product types
const defaultSizes = {
  clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  shoes: ['6', '7', '8', '9', '10', '11', '12', '13'],
  numeric: ['28', '30', '32', '34', '36', '38', '40', '42'],
  generic: ['Small', 'Medium', 'Large', 'Extra Large'],
};

interface SizeSelectorProps {
  control: any;
  errors?: any;
  sizeType?: 'clothing' | 'shoes' | 'numeric' | 'generic';
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  allowCustom?: boolean;
  maxSelections?: number;
}

const SizeSelector: React.FC<SizeSelectorProps> = ({
  control,
  errors,
  sizeType = 'clothing',
  label = 'Sizes',
  description = 'Select sizes available for your product',
  required = false,
  className,
  allowCustom = true,
  maxSelections,
}) => {
  const [customSizes, setCustomSizes] = React.useState<string[]>([]);
  const [showCustomInput, setShowCustomInput] = React.useState<boolean>(false);
  const [newSize, setNewSize] = React.useState<string>('');

  const availableSizes = [...defaultSizes[sizeType], ...customSizes];

  const addCustomSize = () => {
    if (newSize.trim() && !availableSizes.includes(newSize.trim())) {
      setCustomSizes([...customSizes, newSize.trim()]);
      setShowCustomInput(false);
      setNewSize('');
    }
  };

  const removeCustomSize = (sizeToRemove: string) => {
    setCustomSizes(customSizes.filter((size) => size !== sizeToRemove));
  };

  const handleSizeClick = (field: any, size: string) => {
    const currentValues = field.value || [];
    const isSelected = currentValues.includes(size);

    if (isSelected) {
      // Remove size
      field.onChange(currentValues.filter((s: string) => s !== size));
    } else {
      // Add size (check max selections if set)
      if (maxSelections && currentValues.length >= maxSelections) {
        return; // Don't add if max reached
      }
      field.onChange([...currentValues, size]);
    }
  };

  return (
    <div className={twMerge('space-y-4', className)}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-surface-foreground">
          {label} {required && '*'}
        </label>
        <p className="text-xs text-surface-muted-foreground">{description}</p>
        {maxSelections && (
          <p className="text-xs text-surface-muted-foreground">
            Maximum {maxSelections} size{maxSelections > 1 ? 's' : ''} can be selected
          </p>
        )}
      </div>

      <Controller
        name="sizes"
        control={control}
        render={({ field }) => {
          const selectedSizes = field.value || [];
          const isMaxReached = maxSelections ? selectedSizes.length >= maxSelections : false;

          return (
            <div className="space-y-4">
              {/* Size Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {availableSizes.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  const isCustomSize = customSizes.includes(size);
                  const isDisabled = !isSelected && isMaxReached;

                  return (
                    <div key={size} className="relative group">
                      <button
                        type="button"
                        onClick={() => !isDisabled && handleSizeClick(field, size)}
                        disabled={isDisabled}
                        className={twMerge(
                          'w-12 h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center relative overflow-hidden',
                          'hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-surface-ring focus:ring-offset-2',
                          'text-sm font-medium',
                          isSelected
                            ? 'border-surface-ring shadow-lg scale-105 bg-surface-ring text-surface-ring-foreground'
                            : isDisabled
                            ? 'border-surface-border bg-surface-muted text-surface-muted-foreground cursor-not-allowed opacity-50'
                            : 'border-surface-border hover:border-surface-ring bg-surface text-surface-foreground hover:bg-surface-accent',
                        )}
                      >
                        {isSelected && <CheckIcon className="w-4 h-4 transition-all duration-200" />}
                        {!isSelected && size}
                      </button>

                      {/* Remove button for custom sizes */}
                      {isCustomSize && (
                        <button
                          type="button"
                          onClick={() => removeCustomSize(size)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110"
                        >
                          <XIcon className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Add new size button */}
                {allowCustom && (
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(!showCustomInput)}
                    disabled={isMaxReached}
                    className={twMerge(
                      'w-12 h-12 rounded-lg border-2 border-dashed transition-all duration-200 flex items-center justify-center hover:scale-105 focus:outline-none focus:ring-2 focus:ring-surface-ring focus:ring-offset-2',
                      isMaxReached
                        ? 'border-surface-border bg-surface-muted text-surface-muted-foreground cursor-not-allowed opacity-50'
                        : 'border-surface-border hover:border-surface-ring hover:bg-surface-accent text-surface-muted-foreground',
                    )}
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Custom Size Input */}
              {showCustomInput && (
                <div className="flex items-center gap-3 p-4 bg-surface-accent/50 rounded-lg border border-surface-border">
                  <input
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="Enter custom size"
                    className="flex-1 px-3 py-2 border border-surface-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-surface-ring focus:border-surface-ring placeholder-surface-muted-foreground text-surface-foreground"
                    onKeyPress={(e) => e.key === 'Enter' && addCustomSize()}
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={addCustomSize}
                      disabled={!newSize.trim()}
                      className="px-3 py-1.5 bg-surface-ring text-surface-ring-foreground rounded-md text-sm font-medium hover:bg-surface-ring/90 transition-colors duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckIcon className="w-3 h-3" />
                      Add
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomInput(false);
                        setNewSize('');
                      }}
                      className="px-3 py-1.5 bg-surface-muted text-surface-muted-foreground rounded-md text-sm font-medium hover:bg-surface-muted/80 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Selected sizes display */}
              {selectedSizes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-surface-foreground">
                    Selected Sizes ({selectedSizes.length}
                    {maxSelections ? `/${maxSelections}` : ''})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSizes.map((size: string) => (
                      <div
                        key={size}
                        className="flex items-center gap-2 px-3 py-1.5 bg-surface-accent rounded-md border border-surface-border"
                      >
                        <span className="text-sm text-surface-foreground font-medium">{size}</span>
                        <button
                          type="button"
                          onClick={() => handleSizeClick(field, size)}
                          className="text-surface-muted-foreground hover:text-surface-foreground transition-colors duration-200"
                        >
                          <XIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {selectedSizes.length === 0 && (
                <div className="text-center py-6 text-surface-muted-foreground">
                  <p className="text-sm">No sizes selected</p>
                  <p className="text-xs mt-1">Click on sizes above to select them</p>
                </div>
              )}
            </div>
          );
        }}
      />

      {errors?.sizes && <p className="text-sm text-destructive">{errors.sizes.message as string}</p>}
    </div>
  );
};

export default SizeSelector;
