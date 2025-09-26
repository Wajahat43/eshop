'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';

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
  phone_number: string;
  country: string;
};

type UserData = FormData;

const SignupPage = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [timer, setTimer] = useState(0);
  const [sellerData, setSellerData] = useState<UserData | null>(null);
  const [sellerId, setSellerId] = useState<string | undefined>();
  const [isReady, setIsReady] = useState(false);
  const [transitionState, setTransitionState] = useState<'idle' | 'toLogin'>('idle');

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

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
      setServerError(null);
      setSellerId(data?.seller?.id);
      setActiveStep(2);
    },

    onError: (error: AxiosError) => {
      console.error('OTP Verification Error:', error);
      const errorMessage =
        (error.response?.data as any)?.message || error.message || 'Something went wrong. Please try again.';
      setServerError(errorMessage);
    },
  });
  const onSubmit = (data: FormData) => {
    signUpMutation.mutate(data);
  };

  const handleOtpComplete = (otp: string) => {
    setServerError(null); // Clear any previous errors
    verifyOtpMutation.mutate(otp);
  };

  const handleResendOtp = () => {
    if (sellerData) {
      signUpMutation.mutate({ ...sellerData });
    }
  };

  const handleSwitch = () => {
    if (transitionState !== 'idle') return;
    setTransitionState('toLogin');
    setTimeout(() => {
      router.push('/login');
    }, 380);
  };

  const steps = [
    { id: 1, label: 'Create Account' },
    { id: 2, label: 'Setup Shop' },
    { id: 3, label: 'Connect Bank' },
  ];

  const cardClass = useMemo(
    () =>
      twMerge(
        'relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-border/60 bg-card text-foreground shadow-[0_40px_90px_-45px_rgba(15,23,42,0.55)] transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.35)] dark:shadow-[0_40px_90px_-45px_rgba(2,6,23,0.65)] will-change-transform',
        !isReady && 'translate-y-10 opacity-0',
        isReady && transitionState === 'idle' && 'translate-y-0 opacity-100',
        transitionState === 'toLogin' && 'translate-x-[18%] -rotate-1 scale-95 opacity-0',
      ),
    [isReady, transitionState],
  );

  const inputClasses =
    'mt-2 w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-sm font-medium text-foreground shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/70';

  const selectClasses =
    'mt-2 w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-sm font-medium text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/70';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/60 to-background px-4 py-16 transition-colors duration-300">
      <div className={cardClass}>
        <div className="relative grid w-full gap-12 lg:grid-cols-2">
          <section className="flex flex-col px-6 py-10 sm:px-12">
            <header className="mb-8 text-center lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Create your shop</p>
              <h1 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">Become a NextCart Seller</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Complete the steps below to open your storefront and start selling.
              </p>
            </header>

            <div className="relative mb-8 hidden justify-between gap-4 lg:flex">
              <div className="absolute left-8 right-8 top-6 h-px bg-border/60" />
              {steps.map((step, index) => {
                const isCompleted = step.id < activeStep;
                const isActive = step.id === activeStep;
                return (
                  <div key={step.id} className="relative z-10 flex flex-1 flex-col items-center">
                    <div
                      className={twMerge(
                        'flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300',
                        isCompleted || isActive
                          ? 'border-transparent bg-gradient-to-r from-primary via-primary to-[#ff7a6d] text-white shadow-lg shadow-primary/30'
                          : 'border-border bg-background text-muted-foreground',
                      )}
                    >
                      {step.id}
                    </div>
                    <p className="mt-3 text-center text-xs font-semibold text-muted-foreground">{step.label}</p>
                    {index < steps.length - 1 && (
                      <div
                        className={twMerge(
                          'absolute right-[-50%] top-6 h-px w-full',
                          isCompleted ? 'bg-gradient-to-r from-primary via-primary to-[#ff7a6d]' : 'bg-transparent',
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="grow">
              {activeStep === 1 && (
                <>
                  {showOtpInput ? (
                    <div className="flex flex-col items-center gap-6 rounded-2xl border border-primary/30 bg-primary/10 p-8 text-center shadow-sm dark:border-primary/40 dark:bg-primary/15">
                      <p className="text-sm text-muted-foreground">
                        A verification code has been sent to{' '}
                        <span className="font-semibold text-foreground">{sellerData?.email}</span>.
                      </p>
                      <OtpInput
                        length={4}
                        onComplete={handleOtpComplete}
                        onResend={handleResendOtp}
                        canResend={canResend}
                        resendTimer={timer}
                        isLoading={verifyOtpMutation.isPending}
                        error={serverError}
                      />
                      <button
                        onClick={() => setShowOtpInput(false)}
                        className="text-xs font-semibold text-primary transition hover:text-primary/80"
                        type="button"
                      >
                        Go back to sign up
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      <div>
                        <label htmlFor="name" className="text-sm font-semibold text-muted-foreground">
                          Full name
                        </label>
                        <input
                          type="text"
                          id="name"
                          {...register('name', {
                            required: 'Name is required.',
                          })}
                          className={inputClasses}
                        />
                        {errors.name && (
                          <span className="mt-2 block text-xs font-semibold text-destructive">
                            {String(errors.name.message)}
                          </span>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className="text-sm font-semibold text-muted-foreground">
                          Email address
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
                          className={inputClasses}
                        />
                        {errors.email && (
                          <span className="mt-2 block text-xs font-semibold text-destructive">
                            {String(errors.email.message)}
                          </span>
                        )}
                      </div>

                      <div>
                        <label htmlFor="phone" className="text-sm font-semibold text-muted-foreground">
                          Phone number
                        </label>
                        <input
                          type="text"
                          id="phone"
                          placeholder="+91 9876543210"
                          className={inputClasses}
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
                          <span className="mt-2 block text-xs font-semibold text-destructive">
                            {String(errors.phone_number.message)}
                          </span>
                        )}
                      </div>

                      <div>
                        <label htmlFor="country" className="text-sm font-semibold text-muted-foreground">
                          Country
                        </label>
                        <select
                          {...register('country', { required: 'Country is required.' })}
                          className={selectClasses}
                        >
                          {countries.map((country) => (
                            <option key={country.name} value={country.code}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                        {errors.country && (
                          <span className="mt-2 block text-xs font-semibold text-destructive">
                            {String(errors.country.message)}
                          </span>
                        )}
                      </div>

                      <div>
                        <label htmlFor="password" className="text-sm font-semibold text-muted-foreground">
                          Password
                        </label>
                        <div className="relative">
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
                            className={inputClasses}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition hover:text-primary"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                          >
                            {passwordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        {errors.password && (
                          <span className="mt-2 block text-xs font-semibold text-destructive">
                            {String(errors.password.message)}
                          </span>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-primary via-primary to-[#ff7a6d] px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.01] hover:shadow-primary/40"
                        disabled={signUpMutation.isPending}
                      >
                        {signUpMutation.isPending ? 'Sending code…' : 'Send verification code'}
                      </button>
                      {serverError && (
                        <p className="text-center text-xs font-semibold text-destructive">{serverError}</p>
                      )}
                    </form>
                  )}
                </>
              )}

              {activeStep === 2 && sellerId ? (
                <div className="space-y-6 text-muted-foreground">
                  <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
                </div>
              ) : null}
              {activeStep === 3 && sellerId ? (
                <div className="space-y-6 text-muted-foreground">
                  <ConnectBank sellerId={sellerId} />
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-muted/80 p-6 text-center text-sm text-muted-foreground shadow-sm transition-colors duration-300 lg:hidden">
              <p className="font-semibold text-foreground">Already have an account?</p>
              <p className="text-xs text-muted-foreground">
                Log in to manage your profile, view orders, and shop easily.
              </p>
              <button
                type="button"
                onClick={handleSwitch}
                className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2 text-xs font-semibold text-background transition hover:bg-foreground/90"
              >
                Login
              </button>
            </div>
          </section>

          <aside className="relative hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 text-white transition-colors duration-300 dark:from-slate-900 dark:via-slate-950 dark:to-black lg:flex">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -left-24 top-16 h-52 w-52 rounded-full bg-white/20 blur-3xl dark:bg-white/10" />
              <div className="absolute -bottom-12 right-0 h-64 w-64 rounded-full bg-primary/40 blur-3xl" />
            </div>
            <div className="relative z-10 flex w-full flex-col justify-between p-12">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-200/70">Already set up?</p>
                <h2 className="text-3xl font-semibold leading-tight">Already have an account?</h2>
                <p className="text-sm text-slate-200/80">
                  Log in to manage your profile, view orders, and keep growing your shop.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSwitch}
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-lg dark:bg-foreground dark:text-background dark:hover:bg-foreground/90"
              >
                Login
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
