'use client';

import { Pencil, WandSparkles, X } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface ImagePlaceHolderProps {
  size: string;
  small?: boolean;
  onImageChange: (file: File | null, index: number) => void;
  onRemove?: (index: number) => void;
  defaultImage?: string | null;
  currentImageUrl?: string | null;
  setOpenImageModal: (openImageModal: boolean) => void;
  index?: any;
}

const ImagePlaceHolder = (props: ImagePlaceHolderProps) => {
  const { size, small, onImageChange, onRemove, defaultImage, currentImageUrl, setOpenImageModal, index } = props;

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      onImageChange(file, index!);
    }
  };
  return (
    <div
      className={twMerge(
        'relative w-full cursor-pointer border border-border rounded-lg flex flex-col justify-center items-center',
        small ? 'h-[180px]' : 'h-[450px]',
      )}
    >
      <input type="file" accept="image/*" className="hidden" id={`image-upload-${index}`} onChange={handleFileChange} />

      {imagePreview ? (
        <>
          <button
            type="button"
            onClick={() => onRemove?.(index)}
            className="absolute top-3 right-3 p-2 !rounded bg-red-600 shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            className="absolute top-3 right-[70px] p-2 !rounded bg-blue-500 shadow-lg"
            onClick={() => setOpenImageModal(true)}
          >
            <WandSparkles size={16} />
          </button>
        </>
      ) : (
        <label
          className="absolute top-3 right-3 p-2 rounded shadow-lg cursor-pointer"
          htmlFor={`image-upload-${index}`}
        >
          <Pencil size={16} onClick={() => setOpenImageModal(true)} />
        </label>
      )}

      {imagePreview ? (
        <Image
          src={imagePreview}
          alt="uploaded image"
          className="w-full h-full object-cover"
          width={400}
          height={300}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <p className={twMerge('text-sm ', small ? 'text-xl' : 'text-4xl')}>{size}</p>
          <p className={twMerge('pt-2 text-center', small ? 'text-sm' : 'text-lg')}>
            {' '}
            Please choose an image <br /> according to the aspect ratio
          </p>
        </div>
      )}
    </div>
  );
};

export default ImagePlaceHolder;
