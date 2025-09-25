'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { EMAIL_REGEX } from 'apps/user-ui/src/configs/constants';
import { Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { twMerge } from 'tailwind-merge';

type FormData = {
  email: string;
  password: string;
};

const getSafeRedirect = (value: string | null) => {
  if (!value) {
    return '/';
  }

  try {
    const decoded = decodeURIComponent(value);
    const trimmed = decoded.trim();

    if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
      return '/';
    }

    return trimmed === '/login' ? '/' : trimmed;
  } catch (error) {
    return '/';
  }
};

const LoginPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [transitionState, setTransitionState] = useState<'idle' | 'toSignup'>('idle');
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const redirectParam = searchParams.get('redirect');
  const redirectTarget = useMemo(() => getSafeRedirect(redirectParam), [redirectParam]);
  const redirectLabel = redirectTarget !== '/' ? redirectTarget : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/login-user`, data, {
        withCredentials: true,
      });
      return response.data;
    },

    onSuccess: () => {
      setServerError(null);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.replace(redirectTarget || '/');
      router.refresh();
    },

    onError: (error: AxiosError) => {
      setServerError(error.message);
    },
  });

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data);
  };

  const handleSwitch = () => {
    if (transitionState !== 'idle') return;
    setTransitionState('toSignup');
    setTimeout(() => {
      router.push('/signup');
    }, 380);
  };

  const cardClass = useMemo(
    () =>
      twMerge(
        'relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-border/60 bg-card text-foreground shadow-[0_40px_80px_-40px_rgba(15,23,42,0.45)] transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.35)] dark:shadow-[0_40px_80px_-40px_rgba(2,6,23,0.65)] will-change-transform',
        !isReady && 'translate-y-10 opacity-0',
        isReady && transitionState === 'idle' && 'translate-y-0 opacity-100',
        transitionState === 'toSignup' && '-translate-x-[18%] rotate-1 scale-95 opacity-0',
      ),
    [isReady, transitionState],
  );

  const inputClasses =
    'mt-2 w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/70';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/60 to-background px-4 py-16 transition-colors duration-300">
      <div className={cardClass}>
        <div className="relative grid w-full gap-12 lg:grid-cols-2">
          <aside className="relative hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 text-white transition-colors duration-300 dark:from-slate-900 dark:via-slate-950 dark:to-black lg:flex">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -left-24 top-16 h-52 w-52 rounded-full bg-white/20 blur-3xl dark:bg-white/10" />
              <div className="absolute -bottom-12 right-0 h-64 w-64 rounded-full bg-primary/40 blur-3xl" />
            </div>
            <div className="relative z-10 flex w-full flex-col justify-between p-12">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-200/70">New to NextCart?</p>
                <h2 className="text-3xl font-semibold leading-tight">Don't have an account?</h2>
                <p className="text-sm text-slate-200/80">
                  Join the marketplace — where vinyl meets value and discovery.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSwitch}
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-lg dark:bg-foreground dark:text-background dark:hover:bg-foreground/90"
              >
                Sign up
              </button>
            </div>
          </aside>

          <section className="relative flex flex-col justify-center px-6 py-12 sm:px-12">
            <div className="mb-6 flex flex-col gap-2 text-center lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Welcome back</p>
              <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Login to NextCart</h1>
              <p className="text-sm text-muted-foreground">
                Dive back into your favourite crates and keep your wishlist up to date.
              </p>
            </div>

            {redirectLabel && (
              <p className="mb-5 rounded-2xl border border-primary/20 bg-primary/10 px-5 py-3 text-center text-xs font-medium text-primary dark:border-primary/40 dark:bg-primary/15">
                You&apos;ll head back to <span className="font-semibold">{redirectLabel}</span> after logging in.
              </p>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
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
                  <span className="mt-2 block text-xs font-semibold text-destructive">{String(errors.email.message)}</span>
                )}
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-medium text-muted-foreground">
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

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  Remember me
                </label>
                <Link href="/forgot-password" className="text-sm font-semibold text-primary transition hover:text-primary/80">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-primary via-primary to-[#ff7a6d] px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-[1.01] hover:shadow-primary/50"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Logging in…' : 'Login'}
              </button>
              {serverError && <p className="text-center text-xs font-semibold text-destructive">{serverError}</p>}
            </form>

            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-muted/80 p-6 text-center text-sm text-muted-foreground shadow-sm transition-colors duration-300 lg:hidden">
              <p className="font-semibold text-foreground">Don't have an account?</p>
              <p className="text-xs text-muted-foreground">Join the marketplace — where vinyl meets value and discovery.</p>
              <button
                type="button"
                onClick={handleSwitch}
                className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2 text-xs font-semibold text-background transition hover:bg-foreground/90"
              >
                Sign up
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
