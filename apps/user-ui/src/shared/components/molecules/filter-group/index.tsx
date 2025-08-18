import React from 'react';
import { Checkbox } from '../../atoms';

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface FilterGroupProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  disabled?: boolean;
}

const FilterGroup: React.FC<FilterGroupProps> = ({
  title,
  options,
  selectedValues,
  onSelectionChange,
  disabled = false,
}) => {
  const handleOptionChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedValues, optionValue]);
    } else {
      onSelectionChange(selectedValues.filter((value) => value !== optionValue));
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div className="space-y-2">
        {options.map((option) => (
          <Checkbox
            key={option.id}
            id={option.id}
            label={option.label}
            checked={selectedValues.includes(option.value)}
            onChange={(checked) => handleOptionChange(option.value, checked)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};

export default FilterGroup;
