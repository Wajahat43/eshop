'use client';

import { useDiscountCodes } from 'apps/seller-ui/src/hooks/useDiscountCodes';
import useProductCategories from 'apps/seller-ui/src/hooks/useProductCategories';
import ImagePlaceHolder from 'apps/seller-ui/src/shared/components/image-placeholder';
import { Spinner } from 'apps/seller-ui/src/shared/components/spinner';
import axiosInstance from 'apps/seller-ui/src/utils/axiosIsntance';
import { convertFileToBase64 } from 'apps/seller-ui/src/utils/helpers';
import { ChevronRight } from 'lucide-react';
import ColorSelector from 'packages/components/color-selector';
import CustomProperties from 'packages/components/custom-properties';
import CustomSpecifications from 'packages/components/custom-specifications';
import Input from 'packages/components/input';
import { RichTextEditor } from 'packages/components/rich-text-editor';
import SizeSelector from 'packages/components/size-selectors';
import React, { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';
import ImageEnhance from 'apps/seller-ui/src/shared/organisms/ImageEnhance';
import useProduct from 'apps/seller-ui/src/hooks/useProduct';
import { useRouter } from 'next/navigation';

const CreateProduct = () => {
  const [openImageModal, setOpenImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ fileUrl: string; fileId: string } | null>(null);
  const [images, setImages] = useState<({ fileUrl: string; fileId: string } | null)[]>([]);
  const [isChanged, setIsChanged] = useState(false);

  const router = useRouter();

  const { data, isLoading, isError } = useProductCategories();
  const categories = data?.categories || [];
  const subCategoriesData = data?.subCategories || [];

  const { data: discountCodes, isLoading: discountCodesLoading } = useDiscountCodes();
  const discountCodesList = discountCodes?.discountCodes || [];

  const { createProductMutation } = useProduct();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    watch,
  } = useForm();

  const selectedCategory = watch('category');
  const subCategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] : [];
  }, [selectedCategory, subCategoriesData]);

  const onSubmit = (data: any) => {
    createProductMutation.mutate(data, {
      onSuccess: () => {
        router.push('/dashboard/all-products');
      },
    });
  };

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;

    try {
      const filename = await convertFileToBase64(file);
      const response = await axiosInstance.post('/product/api/upload-product-image', { filename });

      const updatedImages = [...images];
      const uploadedImage = {
        fileUrl: response.data.fileUrl,
        fileId: response.data.fileId,
      };
      updatedImages[index] = uploadedImage;
      if (index === updatedImages.length - 1 && updatedImages.length < 8) {
        updatedImages.push(null);
      }
      setImages(updatedImages);
      setValue('images', updatedImages);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleImageRemoved = async (index: number) => {
    try {
      const updatedImages = [...images];

      const imageToRemove = updatedImages[index];
      if (imageToRemove && typeof imageToRemove === 'object') {
        await axiosInstance.delete(`/product/api/delete-product-image`, {
          data: { fileId: imageToRemove.fileId },
        });
      }

      updatedImages.splice(index, 1);
      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }
      setImages(updatedImages);
      setValue('images', updatedImages);
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  //TODO: Save the draft product in the database
  const handleSaveDraft = () => {
    console.log('save draft');
  };

  return (
    <form className="w-full mx-auto p-8 shadow-md rounded-lg" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-2xl py-2 font-semibold font-Poppins">Create Product</h2>
      <div className="flex items-center">
        <span className="cursor-pointer opacity-90">Dashboard</span>
        <ChevronRight />
        <span className="cursor-pointer">Create Product</span>
      </div>

      {/**Content layout */}
      <div className="py-4 w-full flex gap-6">
        {/**Left Side - Image upload section */}
        <div className="md:w-[35%]">
          {images.length >= 0 && (
            <ImagePlaceHolder
              size="765 x 850"
              small={false}
              onImageChange={handleImageChange}
              onRemove={handleImageRemoved}
              setOpenImageModal={() => {
                setOpenImageModal(true);
                setSelectedImage(images[0]);
              }}
              index={0}
            />
          )}

          <div className="grid grid-cols-2 gap-3 mt-4">
            {images.slice(1).map((_, index) => (
              <ImagePlaceHolder
                size="375 x 450"
                small={true}
                onImageChange={handleImageChange}
                onRemove={handleImageRemoved}
                setOpenImageModal={() => {
                  setOpenImageModal(true);
                  setSelectedImage(images[index + 1]);
                }}
                index={index + 1}
                key={index}
              />
            ))}
          </div>
        </div>

        {/**Right side - from inputs */}
        <div className="md:w-[65%]">
          <div className="w-full flex gap-6">
            {/**Product Fields Input */}
            <div className="w-2/4">
              <Input
                label="Product Title *"
                placeholder="Enter product title"
                {...register('title', {
                  required: {
                    value: true,
                    message: 'Product title is required',
                  },
                })}
                type="text"
                className="w-full"
                // error={errors.title}
              />
              {errors.title && <p className="text-red-500">{errors.title.message as string}</p>}

              {/**Text Area for description */}
              <Input
                type="textarea"
                rows={7}
                cols={10}
                label="Description * (Max 150 words)"
                placeholder="Enter product description"
                {...register('description', {
                  required: {
                    value: true,
                    message: 'Product description is required',
                  },
                  validate: (value) => {
                    const wordCount = value.trim().split(/\s+/).length;
                    if (wordCount > 150) {
                      return `Description must be less than 150 words (Current: ${wordCount})`;
                    }

                    return true;
                  },
                })}
                className="w-full"
              />
              {errors.description && <p className="text-red-500">{errors.description.message as string}</p>}

              {/**Tags Input */}
              <div className="mt-2">
                <Input
                  type="text"
                  label="Tags *"
                  placeholder="Enter tags (apple,flamingo,etc)"
                  {...register('tags', {
                    required: {
                      value: true,
                      message: 'Separate tags with commas',
                    },
                    validate: (value) => {
                      const tags = value.trim().split(',');
                      if (tags.length > 5) {
                        return `Tags must be less than 5 (Current: ${tags.length})`;
                      }
                      return true;
                    },
                  })}
                  className="w-full"
                />
                {errors.tags && <p className="text-red-500">{errors.tags.message as string}</p>}
              </div>

              {/**Warrantry */}
              <div className="mt-2">
                <Input
                  type="text"
                  label="Warrantry *"
                  placeholder="Year / No Warranty"
                  {...register('warranty', {
                    required: {
                      value: true,
                      message: 'Warranty is required',
                    },
                  })}
                  className="w-full"
                />
                {errors.warranty && <p className="text-red-500">{errors.warranty.message as string}</p>}
              </div>

              {/**Slug */}
              <div className="mt-2">
                <Input
                  type="text"
                  label="Slug *"
                  placeholder="Enter slug"
                  {...register('slug', {
                    required: 'Slug is required!',
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message: 'Slug can only contain lowercase letters, numbers, and hyphens',
                    },
                    minLength: {
                      value: 3,
                      message: 'Slug must be at least 3 characters long',
                    },
                    maxLength: {
                      value: 50,
                      message: 'Slug must be less than 50 characters long',
                    },
                  })}
                  className="w-full"
                />
                {errors.slug && <p className="text-red-500">{errors.slug.message as string}</p>}
              </div>

              {/** Brand */}
              <div className="mt-2">
                <Input type="text" label="Brand" placeholder="Enter brand" {...register('brand')} />
                {errors.brand && <p className="text-red-500">{errors.brand.message as string}</p>}
              </div>

              {/**Price Input */}
              <div className="mt-2">
                <Input
                  type="number"
                  label="Price *"
                  placeholder="Enter price"
                  {...register('price', {
                    required: {
                      value: true,
                      message: 'Price is required',
                    },
                  })}
                  className="w-full"
                />
                {errors.price && <p className="text-red-500">{errors.price.message as string}</p>}
              </div>

              {/**Color Selector */}
              <div className="mt-2">
                <ColorSelector control={control} errors={errors} />
              </div>

              {/**Custom Specifications */}
              <div className="mt-2">
                <CustomSpecifications control={control} errors={errors} />
              </div>

              {/**Custom Properties */}
              <div className="mt-2">
                <CustomProperties control={control} errors={errors} />
              </div>

              <div className="mt-2">
                {/**Cash on deliver */}
                <label className="block font-semibold">Cash on Delivery *</label>
                <select
                  className="w-full"
                  {...register('cash_on_delivery', {
                    required: 'Cash on delivery is required',
                  })}
                >
                  <option value="yes">Yes</option>
                  <option value="none">No</option>
                </select>
                {errors.cash_on_delivery && <p className="text-red-500">{errors.cash_on_delivery.message as string}</p>}
              </div>
            </div>

            <div className="w-2/4">
              <div className="mt-2">
                <label className="block font-semibold">Category *</label>
                {isLoading ? (
                  <Spinner />
                ) : isError ? (
                  <p className="text-destructive">Error loading categories</p>
                ) : (
                  <>
                    <Controller
                      name="category"
                      control={control}
                      rules={{
                        required: 'Category is required',
                      }}
                      render={({ field }) => (
                        <select className="w-full border border-border rounded-md p-2 text-foreground" {...field}>
                          <option value="">Select Category</option>
                          {categories?.map((category: string) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.category && <p className="text-red-500">{errors.category.message as string}</p>}
                  </>
                )}
              </div>

              {/**Sub Category */}
              <div className="mt-2">
                <label className="block font-semibold">Sub Category *</label>
                <Controller
                  name="subCategory"
                  control={control}
                  rules={{
                    required: 'Sub category is required',
                  }}
                  render={({ field }) => (
                    <select className="w-full border border-border rounded-md p-2 text-foreground" {...field}>
                      <option value="">Select Sub Category</option>
                      {subCategories?.map((subCategory: string) => (
                        <option key={subCategory} value={subCategory}>
                          {subCategory}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.subCategory && <p className="text-red-500">{errors.subCategory.message as string}</p>}
              </div>

              {/**Detailed description */}
              <div className="mt-2">
                <label className="block font-semibold">Detailed Description * (Min 100 words)</label>
                <Controller
                  name="detailed_description"
                  control={control}
                  rules={{
                    required: 'Detailed description is required',
                    validate: (value) => {
                      const wordCount = value.trim().split(/\s+/).length;
                      if (wordCount < 100) {
                        return 'Detailed description must be at least 100 words';
                      }
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Enter detailed description"
                    />
                  )}
                />
                {errors.detailed_description && (
                  <p className="text-red-500">{errors.detailed_description.message as string}</p>
                )}
              </div>

              {/**YouTube Video URL */}
              <div className="mt-2">
                <label className="block font-semibold">YouTube Video URL</label>
                <Input
                  type="text"
                  placeholder="https://www.youtube.com/embed/VIDEO_ID"
                  {...register('youtube_video_url', {
                    pattern: {
                      value: /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+$/,
                      message:
                        'Please enter a valid embedded YouTube video URL (e.g., https://www.youtube.com/embed/VIDEO_ID)',
                    },
                  })}
                  className="w-full"
                />
                {errors.youtube_video_url && (
                  <p className="text-red-500">{errors.youtube_video_url.message as string}</p>
                )}
              </div>

              {/**Regular Price */}
              <div className="mt-2">
                <label className="block font-semibold">Regular Price</label>
                <Input
                  type="number"
                  placeholder="Enter regular price"
                  {...register('regular_price', {
                    required: 'Regular price is required',
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: 'Regular price must be greater than 0',
                    },
                    validate: (value) => {
                      if (isNaN(value) || value <= 0) {
                        return 'Please enter a valid price';
                      }
                      return true;
                    },
                  })}
                  className="w-full"
                />
                {errors.regular_price && <p className="text-red-500">{errors.regular_price.message as string}</p>}
              </div>

              {/**Sale Price same as regular price */}
              <div className="mt-2">
                <label className="block font-semibold">Sale Price</label>
                <Input
                  type="number"
                  placeholder="Enter sale price"
                  {...register('sale_price', {
                    required: 'Sale price is required',
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: 'Sale price must be greater than 0',
                    },
                    validate: (value) => {
                      if (isNaN(value) || value <= 0) {
                        return 'Please enter a valid price';
                      }
                      const regularPrice = watch('regular_price');
                      if (regularPrice && value >= regularPrice) {
                        return 'Sale price must be less than regular price';
                      }
                      return true;
                    },
                  })}
                  className="w-full"
                />
                {errors.sale_price && <p className="text-red-500">{errors.sale_price.message as string}</p>}
              </div>

              {/**Stock */}
              <div className="mt-2">
                <label className="block font-semibold">Stock *</label>
                <Input
                  type="number"
                  placeholder="Enter stock"
                  {...register('stock', {
                    required: 'Stock is required',
                    valueAsNumber: true,
                    min: {
                      value: 0,
                      message: 'Stock must be at least 0',
                    },
                    max: {
                      value: 1000000,
                      message: 'Stock must be less than 1,000,000',
                    },
                    validate: (value) => {
                      if (isNaN(value)) return 'Only numbers are allowed!';
                      if (!Number.isInteger(value)) return 'Stock must be an integer!';
                      return true;
                    },
                  })}
                  className="w-full"
                />
                {errors.stock && <p className="text-red-500">{errors.stock.message as string}</p>}
              </div>

              <div className="mt-2">
                <SizeSelector
                  control={control}
                  errors={errors}
                  sizeType="clothing"
                  label="Sizes *"
                  description="Select sizes available for your product"
                  required={true}
                  className="w-full"
                  allowCustom={false}
                  maxSelections={10}
                />
              </div>

              <div className="mt-3">
                <label className="block font-semibold">Select Discount Codes (Optional)</label>
                {discountCodesLoading ? (
                  <Spinner />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {discountCodesList.map((code) => (
                      <button
                        key={code.id}
                        type="button"
                        className={twMerge(
                          'px-3 py-1 rounded-md text-sm font-semibold border border-border',
                          watch('discount_codes')?.includes(code.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground',
                        )}
                        onClick={() => {
                          const currentDiscountCodes = watch('discount_codes') || [];
                          if (currentDiscountCodes.includes(code.id)) {
                            setValue(
                              'discount_codes',
                              currentDiscountCodes.filter((id: string) => id !== code.id),
                            );
                          } else {
                            setValue('discount_codes', [...currentDiscountCodes, code.id]);
                          }
                        }}
                      >
                        {code.public_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {openImageModal && selectedImage?.fileUrl && (
        <ImageEnhance
          imageUrl={selectedImage?.fileUrl}
          setImageUrl={(url) => setSelectedImage({ fileUrl: url, fileId: selectedImage?.fileId || '' })}
          isOpen={openImageModal}
          setIsOpen={setOpenImageModal}
        />
      )}

      <div className="mt-6 flex justify-end gap-3">
        {isChanged && (
          <button
            className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground"
            type="button"
            onClick={handleSaveDraft}
          >
            Save Draft
          </button>
        )}
        <button className="px-4 py-2 bg-primary rounded-md" type="submit">
          Publish
        </button>
      </div>
    </form>
  );
};

export default CreateProduct;
