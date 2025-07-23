'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { EMAIL_REGEX } from 'apps/user-ui/src/configs/constants';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import OtpInput from 'apps/user-ui/src/shared/components/OtpInput';

type FormData = {
  email: string;
  password: string;
};
const ForgotPassword = () => {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [otp, setOtp] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [canResend, setCanResend] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const requestOtpMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/forgot-password-user`, {
        email,
      });
      return response.data;
    },

    onSuccess: (_, { email }) => {
      setUserEmail(email);
      setStep('otp');
      setCanResend(false);
      setServerError(null);
    },

    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message: string }).message || 'Failed to verify Email. Please try again.';
      setServerError(errorMessage);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ otp }: { otp: string }) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-forgot-password-otp`, {
        email: userEmail,
        otp,
      });
      return response.data;
    },

    onSuccess: (_, { otp }) => {
      setStep('reset');
      setOtp(otp);
      setServerError(null);
    },

    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as { message: string }).message || 'Invalid OTP! Please try again.';
      setServerError(errorMessage);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      if (!password) return;
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/reset-password-user`, {
        email: userEmail,
        newPassword: password,
        otp,
      });

      return response.data;
    },

    onSuccess: () => {
      toast.success('Password reset successfully! Please login with your new password.');
      setStep('email');
      setServerError(null);
      router.push('/login');
    },

    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as { message: string }).message || 'Invalid OTP! Please try again.';
      setServerError(errorMessage);
    },
  });

  const onSubmitMail = ({ email }: { email: string }) => {
    requestOtpMutation.mutate({ email });
  };

  const onVerifyOtp = (otp: string) => {
    verifyOtpMutation.mutate({ otp });
  };

  const onSubmitPassword = ({ password }: { password: string }) => {
    resetPasswordMutation.mutate({ password });
  };

  const onResendOtp = () => {
    if (userEmail) {
      requestOtpMutation.mutate({ email: userEmail });
    } else {
      toast.success('Please enter email');
    }
  };

  return (
    <div className="w-full py-10 min-h-[85svh] bg-card">
      <h1 className="text-4xl font-Poppins font-semibold text-center">Forgot Password</h1>
      <p className="text-center text-lg font-medium py-3">Home . Forgot Password</p>
      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 shadow rounded-lg flex flex-col">
          <h3 className="text-3xl font-semibold text-center mb-2">Reset Your Password</h3>
          <p className="text-center text-gray-500 mb-4">
            Go back to{' '}
            <Link href="/login" className="text-primary font-semibold">
              Login
            </Link>
          </p>

          {step === 'email' && (
            <form onSubmit={handleSubmit(onSubmitMail)}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  {...register('email', {
                    required: 'Email is required.',
                    pattern: {
                      value: EMAIL_REGEX,
                      message: 'Invalid Email',
                    },
                  })}
                  className="mt-1 p-2 w-full border rounded-md outline-0 mb-1 dark:text-black"
                />
                {errors.email && <span className="text-red-500 text-sm">{String(errors.email.message)}</span>}
              </div>

              <button
                type="submit"
                className="w-full bg-primary mt-4 text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors duration-300"
                disabled={requestOtpMutation.isPending}
              >
                Submit
              </button>
              {serverError && <p className="text-red-500 text-sm mt-2 text-center">{serverError}</p>}
            </form>
          )}

          {step == 'otp' && (
            <OtpInput
              length={4}
              onComplete={onVerifyOtp}
              onResend={onResendOtp}
              canResend={canResend}
              resendTimer={timer}
              isLoading={verifyOtpMutation.isPending}
              error={
                verifyOtpMutation.isError && verifyOtpMutation.error instanceof AxiosError
                  ? verifyOtpMutation.error.message
                  : null
              }
            />
          )}

          {step === 'reset' && (
            <>
              <h3 className="text-xl font-semibold text-center mb-4">Reset Password</h3>
              <form onSubmit={handleSubmit(onSubmitPassword)}>
                <label className="block mb-1">New Password</label>
                <input
                  type="password"
                  id="password"
                  {...register('password', {
                    required: 'Password is required.',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters.',
                    },
                  })}
                  className="mt-1 p-2 w-full border rounded-md outline-0 mb-1 dark:text-black"
                />

                {errors.password && <span className="text-red-500 text-sm">{String(errors.password.message)}</span>}

                <button
                  type="submit"
                  className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors duration-300"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? 'Resetting Password...' : 'Reset Password'}
                </button>
                {serverError && <p className="text-red-500 text-sm mt-2 text-center">{serverError}</p>}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
