'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

import { EMAIL_REGEX, PHONE_REGEX } from 'apps/seller-ui/src/configs/constants';
import { Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import OtpInput from 'apps/seller-ui/src/shared/components/otpInput';
import countries from 'apps/seller-ui/src/utils/countries';
import CreateShop from 'apps/seller-ui/src/shared/modules/auth/create-shop';
import { ConnectBank } from 'apps/seller-ui/src/shared/modules/auth/connect-bank';

type FormData = {
  name: string;
  email: string;
  password: string;
};

type UserData = {
  name: string;
  email: string;
  password: string;
};

const page = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [timer, setTimer] = useState(0);
  const [sellerData, setSellerData] = useState<UserData | null>(null);
  const [sellerId, setSellerId] = useState();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const signUpMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/seller-registration`, data);
      return response.data;
    },

    onSuccess: (_, formData) => {
      setSellerData(formData);
      setShowOtpInput(true);
      setCanResend(false);
      setTimer(60);
    },

    onError: (error: AxiosError) => {
      setServerError(error.message);
      console.log('Error', error);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (otp: string) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-seller`, {
        ...sellerData,
        otp,
      });
      return response.data;
    },

    onSuccess: (data) => {
      setSellerId(data?.seller?.id);
      setActiveStep(2);
    },
  });
  const onSubmit = (data: any) => {
    signUpMutation.mutate(data);
  };

  const handleOtpComplete = (otp: string) => {
    verifyOtpMutation.mutate(otp);
  };

  const handleResendOtp = () => {
    if (sellerData) {
      signUpMutation.mutate({ ...sellerData });
    }
  };

  return (
    <div className="w-full flex flex-col items-center pt-10 min-h-svh">
      {/**Stepper */}
      <div className="relative flex items-center justify-between md:w-[50%] mb-8">
        <div className="absolute top-5 left-10 right-10 h-1 bg-border -z-10" />
        {[1, 2, 3].map((step) => {
          return (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 items-center justify-center rounded-full color-foreground font-bold flex ${
                  step <= activeStep ? 'bg-primary' : 'bg-muted'
                }`}
              >
                {step}
              </div>

              <span className="mt-2 text-sm text-center">
                {step === 1 ? 'Create Account' : step === 2 ? 'Setup Shop' : 'Connect bank'}
              </span>
            </div>
          );
        })}
      </div>

      {/**Steps Content */}
      <div className="md:w-[480px] p-8 shadow rounded-lg">
        {activeStep === 1 && (
          <>
            {showOtpInput ? (
              <div className="flex flex-col items-center">
                <p className="text-center text-gray-500 mb-4">
                  A verification code has been sent to {sellerData?.email}.
                </p>
                <OtpInput
                  length={4}
                  onComplete={handleOtpComplete}
                  onResend={handleResendOtp}
                  canResend={canResend}
                  resendTimer={timer}
                  isLoading={verifyOtpMutation.isPending}
                  error={
                    verifyOtpMutation.isError && verifyOtpMutation.error instanceof AxiosError
                      ? verifyOtpMutation.error.message
                      : null
                  }
                />
                <button
                  onClick={() => setShowOtpInput(false)}
                  className="mt-4 text-primary font-semibold hover:underline"
                >
                  Go back to signup
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <h3 className="text-3xl font-semibold text-center mb-2">Create Account</h3>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register('name', {
                      required: 'Name is required.',
                    })}
                    className="mt-1 p-2 w-full border rounded-md outline-0 mb-1 dark:text-black"
                  />
                  {errors.name && <span className="text-red-500 text-sm">{String(errors.name.message)}</span>}
                </div>
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
                <div className="mb-4 relative">
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phone"
                    placeholder="+91 9876543210"
                    className="mt-1 p-2 w-full border rounded-md outline-0 mb-1 dark:text-black"
                    {...register('phone_number', {
                      required: 'Phone number is required.',
                      pattern: {
                        value: PHONE_REGEX,
                        message: 'Invalid Phone Number',
                      },
                      minLength: {
                        value: 10,
                        message: 'Phone number must be at least 10 digits.',
                      },
                      maxLength: {
                        value: 14,
                        message: 'Phone number must be at most 10 digits.',
                      },
                    })}
                  />
                  {errors.phone_number && (
                    <span className="text-red-500 text-sm">{String(errors.phone_number.message)}</span>
                  )}
                </div>
                <div className="mb-4">
                  <label htmlFor="country" className="block text-sm font-medium mb-1">
                    Country
                  </label>
                  <select
                    className="w-full p-2 border border-border outline-0 rounded-[4px]"
                    {...register('country', {
                      required: 'Country is required.',
                    })}
                  >
                    {countries.map((country) => (
                      <option key={country.name} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>

                  {errors.country && <span className="text-red-500 text-sm">{String(errors.country.message)}</span>}
                </div>
                <div className="mb-4 relative">
                  <label htmlFor="password" className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <input
                    type={passwordVisible ? 'text' : 'password'}
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
                  <button
                    type="button"
                    className="absolute top-[50%] right-3 p-1  flex items-center text-sm leading-5"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {errors.password && <span className="text-red-500 text-sm">{String(errors.password.message)}</span>}
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors duration-300"
                  disabled={signUpMutation.isPending}
                >
                  {signUpMutation.isPending ? 'Signing up...' : 'Sign Up'}
                </button>
                {serverError && <p className="text-red-500 text-sm mt-2 text-center">{serverError}</p>}

                <p className="text-center text-gray-500 mt-4">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary font-semibold hover:underline">
                    Login
                  </Link>
                </p>
              </form>
            )}
          </>
        )}

        {activeStep === 2 && sellerId && <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />}
        {activeStep === 3 && sellerId && <ConnectBank sellerId={sellerId} />}
      </div>
    </div>
  );
};

export default page;
