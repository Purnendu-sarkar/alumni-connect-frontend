'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowUpRight, CheckCircle2, Clock, ShieldAlert, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { verifyEmail } from '@/lib/api/auth.api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [resolvedRole, setResolvedRole] = useState<string>(
    (searchParams.get('role') || 'STUDENT').toUpperCase(),
  );

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No verification token was provided in the verification link.');
      return;
    }

    verifyEmail(token)
      .then((res) => {
        if (res.data?.role) {
          setResolvedRole(res.data.role.toUpperCase());
        }
        setStatus('success');
      })
      .catch((err: unknown) => {
        setStatus('error');
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'This verification link is invalid, expired, or has already been used.',
        );
      });
  }, [token]);

  if (status === 'verifying') {
    return (
      <div className="w-full max-w-[490px] bg-white rounded-[32px] sm:rounded-[36px] border border-white/90 shadow-[0_24px_50px_-12px_rgba(15,23,42,0.12),0_10px_24px_-6px_rgba(37,99,235,0.08),0_0_1px_1px_rgba(255,255,255,1)] p-8 sm:p-11 space-y-4 text-center relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Sparkles size={24} className="animate-spin text-blue-600" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight m-0">
          Confirming your credentials…
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 m-0 leading-relaxed">
          Verifying your institutional email address against campus directory records.
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-full max-w-[490px] bg-white rounded-[32px] sm:rounded-[36px] border border-white/90 shadow-[0_24px_50px_-12px_rgba(15,23,42,0.12),0_10px_24px_-6px_rgba(37,99,235,0.08),0_0_1px_1px_rgba(255,255,255,1)] p-8 sm:p-11 space-y-6 relative z-10">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 font-sans">
            VERIFICATION EXPIRED OR INVALID
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 m-0 pt-0.5">
            <ShieldAlert size={28} className="text-rose-600 shrink-0" />
            <span>Link is no longer valid.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 m-0 pt-1 leading-relaxed">
            {errorMessage || 'This verification link has expired or was already verified.'}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <Button asChild className="flex-1 h-12 rounded-xl text-sm font-semibold justify-center">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild variant="secondary" className="flex-1 h-12 rounded-xl text-sm font-semibold justify-center">
            <Link href="/register">Register Again</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isAlumni = resolvedRole === 'ALUMNI';

  return (
    <div className="w-full max-w-[490px] bg-white rounded-[32px] sm:rounded-[36px] border border-white/90 shadow-[0_24px_50px_-12px_rgba(15,23,42,0.12),0_10px_24px_-6px_rgba(37,99,235,0.08),0_0_1px_1px_rgba(255,255,255,1)] p-8 sm:p-11 space-y-6 relative z-10">
      <div className="space-y-1">
        <span className={`text-xs font-bold uppercase tracking-wider font-sans ${isAlumni ? 'text-amber-600' : 'text-emerald-600'}`}>
          {isAlumni ? 'EMAIL VERIFIED — ACCREDITATION PENDING' : 'EMAIL CONFIRMED — ACCOUNT ACTIVATED'}
        </span>

        {isAlumni ? (
          <>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5 m-0 pt-1">
              <Clock size={32} className="text-amber-600 shrink-0" />
              <span>Under Review.</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 m-0 pt-1 leading-relaxed">
              Your university institutional email is confirmed! As a graduate, your alumni status has been queued for verification by the university administration.
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <p className="font-bold text-slate-900 m-0">WHAT HAPPENS NEXT?</p>
              <ul className="list-disc pl-4 m-0 space-y-1 text-slate-600">
                <li>University administration reviews your graduation batch, department, and academic records.</li>
                <li>You will receive an official approval email once accredited.</li>
                <li>After approval, you can sign in to access the Alumni Desk and mentor students.</li>
              </ul>
            </div>

            <div className="pt-2">
              <Button asChild className="w-full h-12 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 justify-center gap-1.5">
                <Link href="/login">
                  <span>Return to Sign in</span>
                  <ArrowUpRight size={16} />
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5 m-0 pt-1">
              <CheckCircle2 size={32} className="text-emerald-600 shrink-0" />
              <span>Account Activated.</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 m-0 pt-1 leading-relaxed">
              Welcome to the verified university network. Your email is verified and your account is ready to sign in.
            </p>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100/90 text-xs text-slate-700 space-y-2">
              <p className="font-bold text-slate-900 m-0">UNLOCKED PRIVILEGES</p>
              <ul className="list-disc pl-4 m-0 space-y-1 text-slate-600">
                <li>Browse verified alumni by batch, department, and current company.</li>
                <li>Send structured mentorship requests to industry seniors.</li>
                <li>Apply directly to campus-exclusive internship and career openings.</li>
              </ul>
            </div>

            <div className="pt-2">
              <Button asChild className="w-full h-12 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 justify-center gap-1.5">
                <Link href="/login">
                  <span>Sign in Now</span>
                  <ArrowUpRight size={16} />
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-medium">Verifying email…</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
