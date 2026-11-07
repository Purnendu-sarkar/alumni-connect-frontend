'use client';

import { CheckCircle2, Loader2, Mail, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { verifyEmail } from '@/lib/api/auth.api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error');
  const [errorMessage, setErrorMessage] = useState<string | null>(
    token ? null : 'No verification token provided.',
  );

  useEffect(() => {
    if (!token) return;

    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setErrorMessage(err.message || 'Invalid or expired email verification link.');
      });
  }, [token]);

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-100">
      {status === 'loading' && (
        <div className="space-y-4">
          <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
          <h1 className="text-xl font-bold text-slate-900">Verifying your email...</h1>
          <p className="text-sm text-slate-500">Please wait while we confirm your university email address.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-4">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h1 className="text-xl font-bold text-slate-900">Email verified successfully!</h1>
          <p className="text-sm text-slate-500">
            Your university email has been verified. You can now sign in to your dashboard.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex w-full justify-center rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4">
          <XCircle className="mx-auto h-12 w-12 text-red-600" />
          <h1 className="text-xl font-bold text-slate-900">Verification Failed</h1>
          <p className="text-sm text-red-600">{errorMessage}</p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex w-full justify-center rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
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

