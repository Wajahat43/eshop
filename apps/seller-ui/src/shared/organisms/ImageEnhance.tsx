import React, { useState } from 'react';
import { Dialog } from '../components';
import Image from 'next/image';
import { AI_ENHANCEMENT_OPTIONS } from '../../utils/Ai.Enhancement';
import { twMerge } from 'tailwind-merge';
import { Wand, Loader2 } from 'lucide-react';

interface ImageEnhanceProps {
  imageUrl: string;
  setImageUrl: (url: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ImageEnhance: React.FC<ImageEnhanceProps> = ({ imageUrl, setImageUrl, isOpen, setIsOpen }) => {
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [isTransformationApplying, setIsTransformationApplying] = useState(false);

  if (!imageUrl) return null;

  const applyTransformation = (effect: string) => {
    if (!imageUrl || isTransformationApplying) return;
    setActiveEffect(effect);
    setIsTransformationApplying(true);

    try {
      // Remove previous transformations
      const urlWithoutTr = imageUrl.replace(/\?tr=[^&]+/, '');
      const transformedUrl = `${urlWithoutTr}?tr=${effect}`;
      setImageUrl(transformedUrl);
    } catch (error) {
      console.error('Error applying transformation:', error);
    } finally {
      setIsTransformationApplying(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Enhance Product Image"
      size="xl"
      showCloseButton={true}
    >
      <div className="flex flex-col space-y-6">
        {/* Image Preview Section */}
        <div className="flex flex-col items-center space-y-4 rounded-md">
          <div className="relative w-full max-w-md h-80 rounded-md overflow-hidden border border-border bg-muted">
            <Image
              src={imageUrl}
              alt="Product Image"
              fill
              key={imageUrl} // Force re-render when URL changes
              unoptimized={imageUrl.includes('?tr=')} // Disable optimization for transformed images
            />
            {isTransformationApplying && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Applying enhancement...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhancement Options Section */}
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-foreground">AI Enhancements</h4>
            <p className="text-sm text-muted-foreground mt-1">Choose an enhancement to apply to your product image</p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
            {AI_ENHANCEMENT_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={twMerge(
                  'relative px-4 py-3 bg-secondary text-secondary-foreground rounded-lg',
                  'flex items-center justify-center gap-2 transition-all duration-200',
                  'hover:bg-primary hover:text-primary-foreground hover:scale-105',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                  activeEffect === option.value &&
                    'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2',
                )}
                onClick={() => applyTransformation(option.value)}
                disabled={isTransformationApplying}
              >
                {isTransformationApplying && activeEffect === option.value ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ImageEnhance;
