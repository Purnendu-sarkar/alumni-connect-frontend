'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ShieldAlert, Sparkles, User } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { setupAccount, validateSetupAccount } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth-store';

function SetupAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const setSession = useAuthStore((state) => state.setSession);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [assignedRole, setAssignedRole] = useState<string>('MODERATOR');

  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenErrorMessage, setTokenErrorMessage] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<{ email?: string; role?: string; university?: { name: string } } | null>(null);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setTokenErrorMessage('No setup token was provided in the invitation link.');
      return;
    }

    validateSetupAccount(token)
      .then((res) => {
        const data = res.data;
        setTokenData(data ?? null);
        if (data?.role) setAssignedRole(data.role);
        setTokenValid(true);
      })
      .catch((err: unknown) => {
        setTokenValid(false);
        setTokenErrorMessage(err instanceof Error ? err.message : 'This invitation link is invalid, expired, or has already been used.');
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('A valid invitation token is required.');
      return;
    }
    if (!name.trim()) {
      setError('Please provide your full legal name.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await setupAccount({ token, name: name.trim(), password });
      const session = res.data;
      if (session?.user) {
        setSession(session);
      }
      setIsSuccess(true);
      setTimeout(() => {
        if (session?.user?.role === 'SUPER_ADMIN') {
          router.push('/admin/dashboard');
        } else if (session?.user?.role === 'MODERATOR') {
          router.push('/moderator/dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Account setup failed. Please try again or request a new invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tokenValid === false) {
    return (
      <div className="w-full max-w-[490px] bg-white rounded-[32px] sm:rounded-[36px] border border-white/90 shadow-[0_24px_50px_-12px_rgba(15,23,42,0.12),0_10px_24px_-6px_rgba(37,99,235,0.08),0_0_1px_1px_rgba(255,255,255,1)] p-8 sm:p-11 space-y-6 relative z-10">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 font-sans">
            ACCESS RESTRICTED
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 m-0 pt-0.5">
            <ShieldAlert size={28} className="text-rose-600 shrink-0" />
            <span>Invalid setup token.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 m-0 pt-1 leading-relaxed">
            {tokenErrorMessage || 'This account initialization token is missing, expired, or has already been consumed.'}
          </p>
        </div>

        <div className="pt-2">
          <Button asChild className="w-full h-12 rounded-xl text-sm font-semibold justify-center">
            <Link href="/login">Return to Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (tokenValid === null) {
    return (
      <div className="w-full max-w-[480px] bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/5 p-8 sm:p-10 space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Sparkles size={24} className="animate-spin text-blue-600" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight m-0">
          Validating invitation…
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 m-0">
          Please wait while we verify your invitation credentials with the university server.
        </p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-[490px] bg-white rounded-[32px] sm:rounded-[36px] border border-white/90 shadow-[0_24px_50px_-12px_rgba(15,23,42,0.12),0_10px_24px_-6px_rgba(37,99,235,0.08),0_0_1px_1px_rgba(255,255,255,1)] p-8 sm:p-11 space-y-6 relative z-10">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 font-sans">
            INITIALIZATION COMPLETE
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5 m-0 pt-0.5">
            <CheckCircle2 size={32} className="text-emerald-600 shrink-0" />
            <span>Welcome aboard.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 m-0 pt-1 leading-relaxed">
            Your credentials have been securely activated. Redirecting to your administrative desk…
          </p>
        </div>

        <div className="pt-2">
          <Button asChild className="w-full h-12 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 justify-center">
            <Link href={assignedRole === 'SUPER_ADMIN' ? '/admin/dashboard' : '/moderator/dashboard'}>
              Open Dashboard Now
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[490px] bg-white rounded-[32px] sm:rounded-[36px] border border-white/80 shadow-[0_25px_60px_-15px_rgba(11,31,58,0.13),0_10px_30px_-5px_rgba(11,31,58,0.06),0_0_0_1px_rgba(255,255,255,0.9)] p-8 sm:p-11 space-y-6 relative z-10">
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-sans">
          STAFF & MODERATOR INVITATION
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight m-0 pt-0.5">
          Configure your account.
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 m-0 pt-0.5">
          You have been invited to join the platform administration desk for {tokenData?.university?.name || 'your university'}.
        </p>
      </div>

      {tokenData?.email && (
        <div className="p-4 bg-blue-50/70 border border-blue-100/90 rounded-2xl text-xs space-y-1">
          <p className="m-0 font-bold text-slate-900">
            ASSIGNED EMAIL:{' '}
            <span className="font-medium text-slate-600">{tokenData.email}</span>
          </p>
          <p className="m-0 pt-0.5 font-bold text-slate-900">
            ROLE ASSIGNMENT:{' '}
            <span className="font-semibold text-blue-700">
              {tokenData.role ?? assignedRole}
            </span>
          </p>
        </div>
      )}

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Full Name *"
          placeholder="e.g. Dr. Shamsul Haque"
          leftIcon={<User size={18} />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <PasswordInput
          label="New Password (min 8 characters) *"
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <PasswordInput
          label="Confirm Password *"
          placeholder="••••••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 justify-center"
        >
          {isSubmitting ? 'Securing Account…' : 'Activate Account'}
        </Button>
      </form>

      <div className="text-center pt-1 border-t border-slate-100">
        <p className="text-xs text-slate-500 m-0">
          Need assistance?{' '}
          <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700">
            Contact administrator
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SetupAccountPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-medium">Loading setup…</div>}>
      <SetupAccountContent />
    </Suspense>
  );
}
