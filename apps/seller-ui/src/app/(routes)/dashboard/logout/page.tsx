'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useLogout from '../../../../hooks/useLogout';
import { LogOut, AlertTriangle } from 'lucide-react';

const LogoutPage = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useLogout();
  const router = useRouter();

  useEffect(() => {
    // Show confirmation dialog immediately when page loads
    setShowConfirmation(true);
  }, []);

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  const handleCancel = () => {
    // Go back to dashboard
    router.push('/');
  };

  if (!showConfirmation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-destructive/10 rounded-full">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Confirm Logout</h3>
        </div>

        <p className="text-muted-foreground mb-6">
          Are you sure you want to logout? You will need to login again to access your seller account.
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={isLoggingOut}
            className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleLogoutConfirm}
            disabled={isLoggingOut}
            className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive-foreground"></div>
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Logout
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;
