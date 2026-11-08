'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { login } from '@/lib/api/auth.api';
import { loginSchema, type LoginValues } from './auth.schemas';

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<{ message: string; code?: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const emailValue = watch('email');

  const onSubmit = async (values: LoginValues) => {
    setFormError(null);
    setResendSuccess(false);
    try {
      const res = await login(values);
      if (res.data?.user) {
        queryClient.setQueryData(['auth', 'me'], res.data.user);
        const role = res.data.user.role;
        if (role === 'STUDENT') router.replace('/student/dashboard');
        else if (role === 'ALUMNI') router.replace('/alumni/dashboard');
        else if (role === 'MODERATOR') router.replace('/moderator/dashboard');
        else if (role === 'SUPER_ADMIN') router.replace('/admin/dashboard');
        else router.replace('/dashboard');
      } else {
        router.replace('/dashboard');
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string; code?: string; statusText?: string };
      setFormError({
        message: errorObj?.message || 'Invalid email or password.',
        code: errorObj?.code || errorObj?.statusText,
      });
    }
  };

  const handleResend = async () => {
    if (!emailValue) return;
    setResendingEmail(true);
    try {
      const { resendVerification } = await import('@/lib/api/auth.api');
      await resendVerification(emailValue);
      setResendSuccess(true);
    } catch {
      // Ignored
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-100">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to Alumni Connect</h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter your institutional credentials to access your dashboard
        </p>
      </div>

      {formError && (
        <div
          className={`mb-5 rounded-xl border p-4 text-xs leading-relaxed ${
            formError.code === 'PENDING_ADMIN_VERIFICATION' ||
            formError.code === 'PENDING_EMAIL_VERIFICATION' ||
            formError.code === 'PENDING_SETUP'
              ? 'border-amber-200 bg-amber-50 text-amber-900'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          <div className="font-semibold mb-1">
            {formError.code === 'PENDING_ADMIN_VERIFICATION' && 'Verification Pending'}
            {formError.code === 'PENDING_EMAIL_VERIFICATION' && 'Email Verification Required'}
            {formError.code === 'PENDING_SETUP' && 'Account Setup Incomplete'}
            {formError.code === 'VERIFICATION_REJECTED' && 'Verification Rejected'}
            {!['PENDING_ADMIN_VERIFICATION', 'PENDING_EMAIL_VERIFICATION', 'PENDING_SETUP', 'VERIFICATION_REJECTED'].includes(formError.code || '') && 'Sign In Error'}
          </div>
          <p>{formError.message}</p>

          {formError.code === 'PENDING_EMAIL_VERIFICATION' && (
            <div className="mt-2.5 pt-2 border-t border-amber-200/60">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendingEmail || resendSuccess}
                className="font-semibold text-amber-800 hover:text-amber-950 underline disabled:opacity-50"
              >
                {resendingEmail
                  ? 'Sending...'
                  : resendSuccess
                    ? 'Verification link resent to your email!'
                    : 'Resend verification email'}
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Institutional Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="email"
              autoComplete="email"
              placeholder="user@university.edu"
              {...register('email')}
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••••••"
              {...register('password')}
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
        Don&apos;t have an account yet?{' '}
        <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
          Create an account
        </Link>
      </div>
    </div>
  );
}
