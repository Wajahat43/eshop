'use client';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, MapPin } from 'lucide-react';
import { UserAddress, CreateAddressData } from '../../../../../hooks/useUserAddresses';
import countries from '../../../../../utils/countries';

interface AddAddressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAddressData) => void;
  address?: UserAddress | null;
  isLoading?: boolean;
}

const addressLabels = ['Home', 'Work', 'Office', 'Other'];

const AddAddressDialog: React.FC<AddAddressDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  address,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateAddressData>();

  const isDefault = watch('isDefault');

  useEffect(() => {
    if (address) {
      setValue('label', address.label);
      setValue('name', address.name);
      setValue('street', address.street);
      setValue('city', address.city);
      setValue('zip', address.zip);
      setValue('country', address.country);
      setValue('isDefault', address.isDefault);
    } else {
      reset();
    }
  }, [address, setValue, reset]);

  const handleFormSubmit = (data: CreateAddressData) => {
    onSubmit(data);
    if (!address) {
      reset();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">{address ? 'Edit Address' : 'Add New Address'}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Address Label *</label>
            <select
              {...register('label', { required: 'Label is required' })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select a label</option>
              {addressLabels.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
            {errors.label && <p className="text-sm text-destructive mt-1">{errors.label.message}</p>}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
            <input
              type="text"
              {...register('name', { required: 'Full name is required' })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Enter full name for delivery"
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>

          {/* Street Address */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Street Address *</label>
            <input
              type="text"
              {...register('street', { required: 'Street address is required' })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Enter street address"
            />
            {errors.street && <p className="text-sm text-destructive mt-1">{errors.street.message}</p>}
          </div>

          {/* City and ZIP */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">City *</label>
              <input
                type="text"
                {...register('city', { required: 'City is required' })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter city"
              />
              {errors.city && <p className="text-sm text-destructive mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">ZIP Code *</label>
              <input
                type="text"
                {...register('zip', { required: 'ZIP code is required' })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter ZIP code"
              />
              {errors.zip && <p className="text-sm text-destructive mt-1">{errors.zip.message}</p>}
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Country *</label>
            <select
              {...register('country', {
                required: 'Country is required',
                validate: (value) =>
                  countries.some((country) => country.name === value) || 'Please select a valid country',
              })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select a country</option>
              {countries.map((country) => (
                <option key={country.code} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
            {errors.country && <p className="text-sm text-destructive mt-1">{errors.country.message}</p>}
          </div>

          {/* Default Address */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              {...register('isDefault')}
              className="h-4 w-4 text-primary border-border rounded focus:ring-primary/20"
            />
            <label htmlFor="isDefault" className="text-sm text-foreground">
              Set as default address
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : address ? 'Update Address' : 'Add Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAddressDialog;
