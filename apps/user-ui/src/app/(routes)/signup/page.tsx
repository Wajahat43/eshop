'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import GoogleButton from 'apps/user-ui/src/shared/components/GoogleButton';
import { EMAIL_REGEX } from 'apps/user-ui/src/configs/constants';
import { Eye, EyeOff } from 'lucide-react';
import OtpInput from 'apps/user-ui/src/shared/components/OtpInput';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';

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
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [timer, setTimer] = useState(0);
  const [userData, setUserData] = useState<UserData | null>(null);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const signUpMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/user-registration`, data);
      return response.data;
    },

    onSuccess: (_, formData) => {
      setUserData(formData);
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
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-user`, {
        ...userData,
        otp,
      });
      return response.data;
    },

    onSuccess: () => {
      router.push('/login');
    },
  });
  const onSubmit = (data: FormData) => {
    signUpMutation.mutate(data);
  };

  const handleOtpComplete = (otp: string) => {
    verifyOtpMutation.mutate(otp);
  };

  const handleResendOtp = () => {
    if (userData) {
      signUpMutation.mutate({ ...userData });
    }
  };

  return (
    <div className="w-full py-10 min-h-[85svh] bg-background-100">
      <h1 className="text-4xl font-Poppins font-semibold text-center">Sign Up</h1>
      <p className="text-center text-lg font-medium py-3">Home . Sign Up</p>
      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 shadow rounded-lg flex flex-col">
          <h3 className="text-3xl font-semibold text-center mb-2">Sign Up for NextCart</h3>
          <p className="text-center text-gray-500 mb-4">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold">
              Login
            </Link>
          </p>

          <GoogleButton onClick={() => {}} className="align-center" />

          <div className="flex items-center my-5 text-sm">
            <div className="flex flex-1 border-t border-border" />
            <span className="px-3">Or Sign up with email</span>
            <div className="flex flex-1 border-t border-border" />
          </div>

          {showOtpInput ? (
            <div className="flex flex-col items-center">
              <p className="text-center text-gray-500 mb-4">A verification code has been sent to {userData?.email}.</p>
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
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default page;
