'use client';
import React from 'react';
import { Controller } from 'react-hook-form';
import { PlusIcon, CheckIcon, XIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const defaultColors = [
  '#000000', //Black
  '#FFFFFF', //White
  '#FF0000', //Red
  '#00FF00', //Green
  '#0000FF', //Blue
  '#FFFF00', //Yellow
  '#FF00FF', //Magenta
  '#00FFFF', //Cyan
];

const ColorSelector = ({ control, errors }: any) => {
  const [customColors, setCustomColors] = React.useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = React.useState<boolean>(false);
  const [newColor, setNewColor] = React.useState<string>('#ffffff');

  const addCustomColor = () => {
    if (newColor && !customColors.includes(newColor)) {
      setCustomColors([...customColors, newColor]);
      setShowColorPicker(false);
      setNewColor('#ffffff');
    }
  };

  const removeCustomColor = (colorToRemove: string) => {
    setCustomColors(customColors.filter((color) => color !== colorToRemove));
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="space-y-2">
        <label htmlFor="color" className="block text-sm font-medium text-surface-foreground">
          Colors *
        </label>
        <p className="text-xs text-surface-muted-foreground">Select or add custom colors for your product</p>
      </div>

      <Controller
        name="colors"
        control={control}
        render={({ field }) => {
          return (
            <div className="space-y-4">
              {/* Color Grid */}
              <div className="grid grid-cols-8 gap-3">
                {[...defaultColors, ...customColors].map((color, index) => {
                  const isSelected = (field.value || []).includes(color);
                  const isCustomColor = customColors.includes(color);
                  const isLightColor = ['#ffffff', '#ffff00', '#00ffff'].includes(color.toLowerCase());

                  return (
                    <div key={color} className="relative group">
                      <button
                        type="button"
                        onClick={() =>
                          field.onChange(
                            isSelected
                              ? field.value.filter((c: string) => c !== color)
                              : [...(field.value || []), color],
                          )
                        }
                        className={twMerge(
                          'w-10 h-10 rounded-lg border-2 transition-all duration-200 flex items-center justify-center relative overflow-hidden',
                          'hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-surface-ring focus:ring-offset-2',
                          isSelected
                            ? 'border-surface-ring shadow-lg scale-105'
                            : 'border-surface-border hover:border-surface-ring',
                        )}
                        style={{ backgroundColor: color }}
                      >
                        {isSelected && (
                          <CheckIcon
                            className={twMerge(
                              'w-4 h-4 transition-all duration-200',
                              isLightColor ? 'text-gray-800' : 'text-white',
                            )}
                          />
                        )}
                      </button>

                      {/* Remove button for custom colors */}
                      {isCustomColor && (
                        <button
                          type="button"
                          onClick={() => removeCustomColor(color)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110"
                        >
                          <XIcon className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Add new color button */}
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-10 h-10 rounded-lg border-2 border-dashed border-surface-border hover:border-surface-ring transition-all duration-200 flex items-center justify-center hover:bg-surface-accent hover:scale-105 focus:outline-none focus:ring-2 focus:ring-surface-ring focus:ring-offset-2"
                >
                  <PlusIcon className="w-4 h-4 text-surface-muted-foreground" />
                </button>
              </div>

              {/* Color Picker */}
              {showColorPicker && (
                <div className="flex items-center gap-3 p-4 bg-surface-accent/50 rounded-lg border border-surface-border">
                  <div className="relative">
                    <input
                      type="color"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 border-surface-border cursor-pointer hover:border-surface-ring transition-colors duration-200"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={addCustomColor}
                      className="px-3 py-1.5 bg-surface-ring text-surface-ring-foreground rounded-md text-sm font-medium hover:bg-surface-ring/90 transition-colors duration-200 flex items-center gap-1"
                    >
                      <CheckIcon className="w-3 h-3" />
                      Add
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowColorPicker(false);
                        setNewColor('#ffffff');
                      }}
                      className="px-3 py-1.5 bg-surface-muted text-surface-muted-foreground rounded-md text-sm font-medium hover:bg-surface-muted/80 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Selected colors display */}
              {field.value && field.value.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-surface-foreground">Selected Colors ({field.value.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((color: string) => (
                      <div
                        key={color}
                        className="flex items-center gap-2 px-2 py-1 bg-surface-accent rounded-md border border-surface-border"
                      >
                        <div
                          className="w-3 h-3 rounded-full border border-surface-border"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs text-surface-foreground font-mono">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }}
      />

      {errors.colors && <p className="text-sm text-destructive">{errors.colors.message as string}</p>}
    </div>
  );
};

export default ColorSelector;
