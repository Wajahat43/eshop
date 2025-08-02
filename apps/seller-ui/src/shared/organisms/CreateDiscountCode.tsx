import React from 'react';
import { useForm } from 'react-hook-form';
import { CreateDiscountCodeData } from '../../hooks/useDiscountCodes';

interface CreateDiscountCodeProps {
  onSubmit: (data: CreateDiscountCodeData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CreateDiscountCode: React.FC<CreateDiscountCodeProps> = ({ onSubmit, onCancel, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDiscountCodeData>({
    defaultValues: {
      public_name: '',
      discountType: 'percentage',
      discountValue: 0,
      discountCode: '',
    },
  });

  const handleFormSubmit = async (data: CreateDiscountCodeData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Failed to create discount code:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-card-foreground">Public Name</label>
          <input
            type="text"
            {...register('public_name', { required: 'Public name is required' })}
            className="w-full p-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
          {errors.public_name && <p className="text-destructive text-sm mt-1">{errors.public_name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-card-foreground">Discount Type</label>
          <select
            {...register('discountType', { required: 'Discount type is required' })}
            className="w-full p-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
          {errors.discountType && <p className="text-destructive text-sm mt-1">{errors.discountType.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-card-foreground">Discount Value (%)</label>
          <input
            type="number"
            {...register('discountValue', {
              required: 'Discount value is required',
              min: { value: 0, message: 'Value must be positive' },
              max: { value: 100, message: 'Percentage cannot exceed 100%' },
            })}
            className="w-full p-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            min="0"
            max="100"
            step="0.01"
          />
          {errors.discountValue && <p className="text-destructive text-sm mt-1">{errors.discountValue.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-card-foreground">Discount Code</label>
          <input
            type="text"
            {...register('discountCode', {
              required: 'Discount code is required',
              pattern: {
                value: /^[A-Z0-9]+$/,
                message: 'Code must contain only uppercase letters and numbers',
              },
            })}
            className="w-full p-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            placeholder="e.g., SAVE20"
            onChange={(e) => (e.target.value = e.target.value.toUpperCase())}
          />
          {errors.discountCode && <p className="text-destructive text-sm mt-1">{errors.discountCode.message}</p>}
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
