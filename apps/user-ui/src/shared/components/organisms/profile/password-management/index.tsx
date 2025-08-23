'use client';

import React, { useRef, useEffect } from 'react';
import ChangePasswordForm, { ChangePasswordFormRef } from '../../../molecules/profile/change-password-form';
import useChangePassword from 'apps/user-ui/src/hooks/useChangePassword';

const PasswordManagement: React.FC = () => {
  const {
    changePassword,
    isLoading: isChangingPassword,
    isError,
    error,
    isSuccess,
    changePasswordMutation,
  } = useChangePassword();
  const formRef = useRef<ChangePasswordFormRef>(null);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        // Manually reset the mutation state to clear success message
        changePasswordMutation.reset();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, changePasswordMutation]);

  const handleChangePassword = (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    changePassword(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          // Reset form only on success
          if (formRef.current) {
            formRef.current.reset();
          }
        },
      },
    );
  };

  return (
    <div>
      {isSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 text-sm font-medium">
            ✅ Password changed successfully! Your new password is now active.
          </p>
        </div>
      )}
      {isError && error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-destructive text-sm">
            {error.response?.data?.message || error.message || 'An error occurred while changing password'}
          </p>
        </div>
      )}
      <ChangePasswordForm ref={formRef} onSubmit={handleChangePassword} isLoading={isChangingPassword} />
    </div>
  );
};

export default PasswordManagement;
