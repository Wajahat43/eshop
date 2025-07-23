'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import GoogleButton from 'apps/user-ui/src/shared/components/GoogleButton';
import { EMAIL_REGEX } from 'apps/user-ui/src/configs/constants';
import { Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';

type FormData = {
  email: string;
  password: string;
};
const page = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/login-user`, data, {
        withCredentials: true,
      });
      return response.data;
    },

    onSuccess: () => {
      setServerError(null);
      router.push('/');
    },

    onError: (error: AxiosError) => {
      setServerError(error.message);
    },
  });

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data);
  };
  return (
    <div className="w-full py-10 min-h-[85svh] bg-card">
      <h1 className="text-4xl font-Poppins font-semibold text-center">Login</h1>
      <p className="text-center text-lg font-medium py-3">Home . Login</p>
      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 shadow rounded-lg flex flex-col">
          <h3 className="text-3xl font-semibold text-center mb-2">Login to NextCart</h3>
          <p className="text-center text-gray-500 mb-4">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary font-semibold">
              Sign up
            </Link>
          </p>

          <GoogleButton onClick={() => {}} className="align-center" />

          <div className="flex items-center my-5 text-sm">
            <div className="flex flex-1 border-t border-border" />
            <span className="px-3">Or Sign in with email</span>
            <div className="flex flex-1 border-t border-border" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="rememberMe" className="text-sm">
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors duration-300"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </button>
            {serverError && <p className="text-red-500 text-sm mt-2 text-center">{serverError}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default page;
