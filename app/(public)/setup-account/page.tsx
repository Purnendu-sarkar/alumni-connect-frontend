'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

import { validateSetupToken, setupAccount } from '@/lib/api/auth.api';
import { setupAccountSchema, type SetupAccountValues } from '@/features/auth/auth.schemas';

function PasswordStrengthMeter({ password }: { password: string }) {
  const hasMinLength = password.length >= 12;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const criteria = [
    { label: '12+ characters', met: hasMinLength },
    { label: 'Lowercase letter', met: hasLower },
    { label: 'Uppercase letter', met: hasUpper },
    { label: 'Number', met: hasNumber },
    { label: 'Special symbol', met: hasSymbol },
  ];

  const metCount = criteria.filter((c) => c.met).length;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full transition-all duration-300 ${
            metCount <= 2
              ? 'w-1/3 bg-red-500'
              : metCount <= 4
                ? 'w-2/3 bg-amber-500'
                : 'w-full bg-emerald-500'
          }`}
        />
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-500 sm:grid-cols-3">
        {criteria.map((c) => (
          <div key={c.label} className="flex items-center gap-1">
            {c.met ? (
              <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0 ml-1 mr-1" />
            )}
            <span className={c.met ? 'text-emerald-700 font-medium' : ''}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SetupAccountContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [validating, setValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [accountInfo, setAccountInfo] = useState<{ email: string; name?: string; role: string } | null>(
    null,
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SetupAccountValues>({
    resolver: zodResolver(setupAccountSchema),
    defaultValues: {
      token: token || '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password') || '';

  useEffect(() => {
    if (!token) {
      setValidating(false);
      setValidationError('No account setup token was provided.');
      return;
    }

    validateSetupToken(token)
      .then((res) => {
        if (res.data) {
          setAccountInfo(res.data);
        }
        setValidating(false);
      })
      .catch((err) => {
        setValidationError(err.message || 'This setup link is invalid or has expired.');
        setValidating(false);
      });
  }, [token]);

  const onSubmit = async (values: SetupAccountValues) => {
    if (!token) return;
    setSubmitError(null);

    try {
      await setupAccount({
        token,
        password: values.password,
      });
      setIsSuccess(true);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to complete account setup. Please try again.';
      setSubmitError(errorMsg);
    }
  };

  if (validating) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-100">
        <Loader2 className="mx-auto h-10 w-10 text-indigo-600 animate-spin" />
        <h2 className="mt-4 text-lg font-bold text-slate-900">Validating Setup Token...</h2>
        <p className="mt-1 text-xs text-slate-500">Checking single-use administrative token validity.</p>
      </div>
    );
  }

  if (validationError) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-100">
        <XCircle className="mx-auto h-12 w-12 text-red-600" />
        <h2 className="mt-4 text-xl font-bold text-slate-900">Setup Link Invalid</h2>
        <p className="mt-2 text-sm text-slate-600">{validationError}</p>
        <p className="mt-2 text-xs text-slate-400">
          Account setup links can only be used once and expire after 48 hours for institutional security.
        </p>
        <div className="mt-6">
          <Link
            href="/login"
            className="inline-flex w-full justify-center rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-100">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h2 className="mt-4 text-2xl font-bold text-slate-900">Account Setup Complete!</h2>
        <p className="mt-2 text-sm text-slate-600">
          Your password has been securely saved and your Super Admin account is now active.
        </p>
        <div className="mt-6">
          <Link
            href="/login"
            className="inline-flex w-full justify-center rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
          >
            Sign In to Super Admin Console
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-100">
      <div className="mb-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-3">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Super Admin Account Setup</h1>
        <p className="mt-1 text-xs text-slate-500">
          Configure a strong password for your university root administrative account
        </p>
        {accountInfo && (
          <div className="mt-3 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {accountInfo.email}
          </div>
        )}
      </div>

      {submitError && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <input type="hidden" {...register('token')} value={token || ''} />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              {...register('password')}
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          <PasswordStrengthMeter password={passwordValue} />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              {...register('confirmPassword')}
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Activating Account...</span>
            </>
          ) : (
            <span>Activate Super Admin Account</span>
          )}
        </button>
      </form>
    </div>
  );
}

export default function SetupAccountPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-2 text-xs text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <span>Loading...</span>
          </div>
        }
      >
        <SetupAccountContent />
      </Suspense>
    </div>
  );
}
