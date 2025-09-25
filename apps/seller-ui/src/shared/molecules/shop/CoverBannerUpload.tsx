'use client';

import React, { useState, useRef } from 'react';
import { useUpdateCoverBanner, useShopInfo } from '../../../hooks/useShop';
import { Upload, Image as ImageIcon, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { convertFileToBase64 } from 'apps/seller-ui/src/utils/helpers';

const CoverBannerUpload: React.FC = () => {
  const { data: shop, isLoading: isLoadingShop } = useShopInfo();
  const updateCoverBanner = useUpdateCoverBanner();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }

    const maxSizeInMB = 5;
    if (file.size > maxSizeInMB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${maxSizeInMB}MB.`);
      return;
    }

    try {
      const base64 = (await convertFileToBase64(file)) as string;
      setSelectedBanner(base64);
    } catch (error) {
      toast.error('Failed to read image file. Please try again.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      void handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      void handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedBanner || updateCoverBanner.isPending) return;

    updateCoverBanner.mutate(
      { coverBanner: selectedBanner },
      {
        onSuccess: () => {
          setSelectedBanner(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        },
      },
    );
  };

  const handleRemove = () => {
    setSelectedBanner(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentBanner = selectedBanner || shop?.coverBanner || null;
  const hasExistingBanner = Boolean(shop?.coverBanner);
  const hasSelectedBanner = Boolean(selectedBanner);

  if (isLoadingShop) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading shop information...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No shop information found. Please create a shop first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Cover Banner</h3>
        <p className="text-sm text-gray-600">Upload a banner image for your shop. Recommended size: 1200x300px</p>
      </div>

      {/* Hidden file input - always present */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInputChange} className="hidden" />

      {/* Current Banner Display */}
      {currentBanner ? (
        <div className="relative">
          <img
            src={currentBanner}
            alt="Shop cover banner"
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
          />
          {hasSelectedBanner && (
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              {isDragging ? (
                <Upload className="w-12 h-12 text-blue-500" />
              ) : (
                <ImageIcon className="w-12 h-12 text-gray-400" />
              )}
            </div>

            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragging ? 'Drop your image here' : 'Upload a cover banner'}
              </p>
              <p className="text-sm text-gray-600 mt-1">Drag and drop an image, or click to browse</p>
            </div>

            <span className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Upload className="w-4 h-4" />
              Choose File
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      {hasSelectedBanner ? (
        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={updateCoverBanner.isPending}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {updateCoverBanner.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {updateCoverBanner.isPending ? 'Uploading…' : 'Upload Banner'}
          </button>

          <button
            onClick={handleRemove}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        hasExistingBanner && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            Change Banner
          </button>
        )
      )}
    </div>
  );
};

export default CoverBannerUpload;
