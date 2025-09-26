'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useUpdateShopInfo, useShopInfo, UpdateShopInfoData } from '../../../hooks/useShop';
import { Save, Loader2 } from 'lucide-react';

const ShopInfoForm: React.FC = () => {
  const { data: shop, isLoading: isLoadingShop } = useShopInfo();
  const updateShopInfo = useUpdateShopInfo();
  const [socialLinks, setSocialLinks] = useState<Array<{ platform: string; url: string }>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateShopInfoData>();

  useEffect(() => {
    if (shop) {
      reset({
        name: shop.name,
        bio: shop.bio,
        address: shop.address,
        opening_hours: shop.opening_hours,
        website: shop.website || '',
        category: shop.category,
      });

      // Initialize social links
      if (shop.social_links && Array.isArray(shop.social_links)) {
        setSocialLinks(shop.social_links);
      }
    }
  }, [shop, reset]);

  const onSubmit = (data: UpdateShopInfoData) => {
    const submitData = {
      ...data,
      social_links: socialLinks,
    };
    updateShopInfo.mutate(submitData);
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '' }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  if (isLoadingShop) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shop Name */}
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Shop Name *
          </label>
          <input
            {...register('name', { required: 'Shop name is required' })}
            type="text"
            id="name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your shop name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            {...register('category', { required: 'Category is required' })}
            id="category"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a category</option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="home">Home & Garden</option>
            <option value="sports">Sports</option>
            <option value="books">Books</option>
            <option value="beauty">Beauty & Health</option>
            <option value="toys">Toys & Games</option>
            <option value="automotive">Automotive</option>
            <option value="other">Other</option>
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <input
            {...register('website')}
            type="url"
            id="website"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://your-website.com"
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Address *
          </label>
          <textarea
            {...register('address', { required: 'Address is required' })}
            id="address"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your shop address"
          />
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
        </div>

        {/* Opening Hours */}
        <div className="md:col-span-2">
          <label htmlFor="opening_hours" className="block text-sm font-medium text-gray-700 mb-2">
            Opening Hours *
          </label>
          <input
            {...register('opening_hours', { required: 'Opening hours are required' })}
            type="text"
            id="opening_hours"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
          />
          {errors.opening_hours && <p className="mt-1 text-sm text-red-600">{errors.opening_hours.message}</p>}
        </div>

        {/* Bio */}
        <div className="md:col-span-2">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
            Shop Description *
          </label>
          <textarea
            {...register('bio', { required: 'Shop description is required' })}
            id="bio"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tell customers about your shop..."
          />
          {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
        </div>
      </div>

      {/* Social Links */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">Social Media Links</label>
          <button
            type="button"
            onClick={addSocialLink}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Add Social Link
          </button>
        </div>

        <div className="space-y-3">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex gap-3 items-end">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Platform (e.g., Facebook, Instagram)"
                  value={link.platform}
                  onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <input
                  type="url"
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="button"
                onClick={() => removeSocialLink(index)}
                className="px-3 py-2 text-red-600 hover:text-red-800 font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={updateShopInfo.isPending}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {updateShopInfo.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {updateShopInfo.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default ShopInfoForm;
