'use client';
import React from 'react';
import { Controller, useFieldArray } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import Input from '../input';

interface Specification {
  name: string;
  value: string;
}

const CustomSpecifications = ({ control, errors }: any) => {
  return (
    <Controller
      name="specifications"
      control={control}
      defaultValue={[]}
      render={({ field }) => {
        const { fields, append, remove } = useFieldArray({
          control,
          name: 'specifications',
        });

        const addSpecification = () => {
          append({ name: '', value: '' });
        };

        const removeSpecification = (index: number) => {
          remove(index);
        };

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-foreground">Custom Specifications</label>
              <button
                type="button"
                onClick={addSpecification}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm"
              >
                <Plus size={14} />
                Add Specification
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center gap-3 p-4 border border-border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex-1">
                    <Input
                      placeholder="Specification name (e.g., Weight, Dimensions)"
                      {...control.register(`specifications.${index}.name` as const)}
                      className="mb-2"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Specification value (e.g., 500g, 10x5x2cm)"
                      {...control.register(`specifications.${index}.value` as const)}
                      className="mb-2"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              {fields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg bg-muted/50">
                  <p className="text-sm">No specifications added yet</p>
                  <p className="text-xs mt-1">Click "Add Specification" to get started</p>
                </div>
              )}
            </div>

            {errors.specifications && (
              <p className="text-sm text-destructive">{errors.specifications.message as string}</p>
            )}
          </div>
        );
      }}
    />
  );
};

export default CustomSpecifications;
