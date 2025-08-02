'use client';
import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import Input from '../input';
import { Plus, X } from 'lucide-react';

interface Property {
  label: string;
  values: string[];
}

const CustomProperties = ({ control, errors }: any) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  const addProperty = () => {
    if (!newLabel.trim()) return;
    setProperties([...properties, { label: newLabel, values: [] }]);
    setNewLabel('');
  };

  const addValue = (index: number) => {
    if (!newValue.trim()) return;
    const updatedProperties = [...properties];
    updatedProperties[index].values.push(newValue);
    setProperties(updatedProperties);
    setNewValue('');
  };

  const removeProperty = (index: number) => {
    const updatedProperties = [...properties];
    updatedProperties.splice(index, 1);
    setProperties(updatedProperties);
  };

  const removeValue = (propertyIndex: number, valueIndex: number) => {
    const updatedProperties = [...properties];
    updatedProperties[propertyIndex].values.splice(valueIndex, 1);
    setProperties(updatedProperties);
  };

  const renderPropertyCard = (property: Property, propertyIndex: number) => (
    <div
      key={propertyIndex}
      className="border border-border bg-card rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-foreground">{property.label}</span>
        <button
          type="button"
          onClick={() => removeProperty(propertyIndex)}
          className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Input
          type="text"
          placeholder="Add value"
          value={newValue}
          onChange={(e: any) => setNewValue(e.target.value)}
          className="flex-1"
        />

        <button
          type="button"
          onClick={() => addValue(propertyIndex)}
          className="bg-primary text-primary-foreground px-3 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium text-sm"
        >
          Add
        </button>
      </div>

      {property.values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {property.values.map((value, valueIndex) => (
            <span
              key={valueIndex}
              className="inline-flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-md bg-accent text-accent-foreground border border-accent-foreground/20"
            >
              {value}
              <button
                type="button"
                onClick={() => removeValue(propertyIndex, valueIndex)}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const renderAddPropertySection = () => (
    <div className="flex items-center gap-3 p-1 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-colors">
      <Input
        type="text"
        placeholder="Enter property label (e.g., Material, Warranty)"
        value={newLabel}
        onChange={(e: any) => setNewLabel(e.target.value)}
        className="flex-1"
      />

      <button
        type="button"
        onClick={addProperty}
        className="bg-primary text-primary-foreground px-3 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium text-sm flex items-center gap-1 shrink-0 w-[20%]"
      >
        <Plus size={14} /> Add
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <Controller
        name={'customProperties'}
        control={control}
        defaultValue={[]}
        render={({ field }) => {
          // Update form value whenever properties change
          React.useEffect(() => {
            field.onChange(properties);
          }, [properties]);

          return (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-foreground mb-1">Custom Properties</label>

              <div className="space-y-4">
                {properties.map((property, index) => renderPropertyCard(property, index))}
                {renderAddPropertySection()}
              </div>

              {errors.customProperties && (
                <p className="text-sm text-destructive mt-2">{errors.customProperties.message as string}</p>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

export default CustomProperties;
