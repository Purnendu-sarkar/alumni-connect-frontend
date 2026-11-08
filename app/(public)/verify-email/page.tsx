'use client';

import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { verifyEmail } from '@/lib/api/auth.api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error');
  const [resultData, setResultData] = useState<{ role?: string; status?: string; message?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    token ? null : 'No verification token provided.',
  );

  useEffect(() => {
    if (!token) return;

    verifyEmail(token)
      .then((res) => {
        setResultData(res?.data || {});
        setStatus('success');
      })
      .catch((err: unknown) => {
        setStatus('error');
        setErrorMessage(
          err instanceof Error ? err.message : 'Invalid or expired email verification link.',
        );
      });
  }, [token]);

  const isAlumniPending = resultData?.role === 'ALUMNI' || resultData?.status === 'PENDING_ADMIN_VERIFICATION';

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-100">
      {status === 'loading' && (
        <div className="space-y-4">
          <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
          <h1 className="text-xl font-bold text-slate-900">Verifying your email...</h1>
          <p className="text-sm text-slate-500">Please wait while we confirm your university email address.</p>
        </div>
      )}

      {status === 'success' && isAlumniPending && (
        <div className="space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Email Verified!</h1>
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-left text-xs leading-relaxed text-amber-900">
            <p className="font-semibold text-amber-950 mb-1">Pending Administrative Verification</p>
            Your university email address is confirmed. To protect the integrity of our verified alumni community, an administrator will review your graduation details. You will receive an email once approved.
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex w-full justify-center rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      )}

      {status === 'success' && !isAlumniPending && (
        <div className="space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Account Activated!</h1>
          <p className="text-sm text-slate-500">
            Your university email has been confirmed and your account is active. You can now sign in to your dashboard.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex w-full justify-center rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition"
            >
              Sign In to Student Desk
            </Link>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <XCircle className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Verification Failed</h1>
          <p className="text-sm text-red-600">{errorMessage}</p>
          <p className="text-xs text-slate-400">
            Verification tokens can only be used once and expire after 24 hours.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex w-full justify-center rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-center text-sm text-slate-500">Loading...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}

