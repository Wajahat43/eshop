'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import Input from 'packages/components/input';

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordFormProps {
  onSubmit: (data: ChangePasswordFormData) => void;
  isLoading?: boolean;
}

export interface ChangePasswordFormRef {
  reset: () => void;
}

const ChangePasswordForm = forwardRef<ChangePasswordFormRef, ChangePasswordFormProps>(
  ({ onSubmit, isLoading = false }, ref) => {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
      register,
      handleSubmit,
      formState: { errors },
      watch,
      reset,
    } = useForm<ChangePasswordFormData>();

    const newPassword = watch('newPassword');

    // Expose reset method to parent component
    useImperativeHandle(ref, () => ({
      reset: () => {
        reset();
      },
    }));

    const handleFormSubmit = (data: ChangePasswordFormData) => {
      onSubmit(data);
      // Don't reset here - let the parent component handle it after success
    };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Change Password</h2>
        <div className="bg-card border border-border rounded-lg p-6">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Current Password */}
            <div className="relative">
              <Input
                label="Current Password *"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Enter your current password"
                {...register('currentPassword', {
                  required: 'Current password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                error={errors.currentPassword?.message}
              />
              <button
                type="button"
                className="absolute top-[65%] right-3 p-1 transform -translate-y-1/2"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>

            {/* New Password */}
            <div className="relative">
              <Input
                label="New Password *"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                  validate: (value) => {
                    if (value === watch('currentPassword')) {
                      return 'New password must be different from current password';
                    }
                    return true;
                  },
                })}
                error={errors.newPassword?.message}
              />
              <button
                type="button"
                className="absolute top-[65%] right-3 p-1 transform -translate-y-1/2"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>

            {/* Confirm New Password */}
            <div className="relative">
              <Input
                label="Confirm New Password *"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                {...register('confirmPassword', {
                  required: 'Please confirm your new password',
                  validate: (value) => {
                    if (value !== newPassword) {
                      return 'Passwords do not match';
                    }
                    return true;
                  },
                })}
                error={errors.confirmPassword?.message}
              />
              <button
                type="button"
                className="absolute top-[65%] right-3 p-1 transform -translate-y-1/2"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md font-medium transition-colors"
              >
                {isLoading ? 'Changing Password...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  },
);

ChangePasswordForm.displayName = 'ChangePasswordForm';

export default ChangePasswordForm;
