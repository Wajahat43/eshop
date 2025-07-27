import { useMutation } from '@tanstack/react-query';
import { shopCategories } from 'apps/seller-ui/src/utils/shopCategories';
import axios from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';

interface CreateShopProps {
  sellerId: string;
  setActiveStep: (step: number) => void;
}
const CreateShop = ({ sellerId, setActiveStep }: CreateShopProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const createShopMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-shop`, data);
      return response.data;
    },

    onSuccess: () => {
      setActiveStep(3);
    },

    onError: (error) => {
      console.log(error);
    },
  });
  const onSubmit = async (data: any) => {
    const shopData = { ...data, sellerId };
    await createShopMutation.mutateAsync(shopData);
  };

  const countWords = (text: string) => {
    return text.split(' ').filter((word) => word.trim() !== '').length;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h3 className="text-2xl font-semibold text-center mb-4">Setup New Shop</h3>
      {/**Shop Name */}
      <div>
        <label htmlFor="name" className="block mb-1">
          Shop Name
        </label>
        <input
          type="text"
          id="name"
          {...register('name')}
          placeholder="Shop Name"
          className="w-full p-2 border border-gray-300 rounded-md outline-0 mb-1"
        />
        {errors.name && <p className="text-danger">{String(errors.name.message)}</p>}
      </div>

      {/**Shop Bio */}
      <div>
        <label htmlFor="bio" className="block mb-1">
          Bio * (Max 100 words)
        </label>
        <textarea
          id="bio"
          {...register('bio', {
            required: 'Bio is required',
            validate: (value) => {
              const wordCount = countWords(value);
              if (wordCount < 10) {
                return 'Bio must be at least 10 words';
              } else if (wordCount > 100) {
                return 'Bio must be less than 100 words';
              }
              return true;
            },
          })}
          placeholder="Bio"
          className="w-full p-2 border border-gray-300 rounded-md outline-0 mb-1"
        />
        {errors.bio && <p className="text-danger">{String(errors.bio.message)}</p>}
      </div>

      {/**Address */}
      <div>
        <label htmlFor="address" className="block mb-1">
          Address
        </label>
        <input
          type="text"
          id="address"
          {...register('address')}
          placeholder="Address"
          className="w-full p-2 border border-gray-300 rounded-md outline-0 mb-1"
        />
      </div>
      {/**Opening hours */}
      <div>
        <label htmlFor="opening_hours" className="block mb-1">
          Opening Hours
        </label>
        <input
          type="text"
          placeholder="e.g. Mon-Sat 10:00 AM - 10:00 PM"
          {...register('opening_hours', {
            required: 'Opening hours is required',
          })}
          className="w-full p-2 border border-gray-300 rounded-md outline-0 mb-1"
        />
        {errors.opening_hours && <p className="text-danger">{String(errors.opening_hours.message)}</p>}
      </div>

      {/**Website */}
      <div>
        <label htmlFor="website" className="block mb-1">
          Website
        </label>
        <input
          type="text"
          placeholder="e.g. https://www.example.com"
          {...register('website', {
            required: 'Website is required',
            pattern: {
              value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
              message: 'Invalid website URL',
            },
          })}
          className="w-full p-2 border border-gray-300 rounded-md outline-0 mb-1"
        />
        {errors.website && <p className="text-danger">{String(errors.website.message)}</p>}
      </div>

      {/**Category */}
      <div>
        <label htmlFor="category" className="block mb-1">
          Category*
        </label>
        <select
          id="category"
          {...register('category', {
            required: 'Categories are required',
          })}
          className="w-full p-2 border border-border outline-0"
        >
          {shopCategories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-danger">{String(errors.category.message)}</p>}
      </div>

      {/*Submit button */}
      <div className="flex justify-center">
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md">
          Create Shop
        </button>
      </div>
    </form>
  );
};

export default CreateShop;
