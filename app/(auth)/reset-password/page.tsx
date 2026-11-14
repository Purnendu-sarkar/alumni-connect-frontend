'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Lock, ShieldAlert } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { resetPassword } from '@/lib/api/auth.api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing or invalid reset token. Please request a new password reset link.');
      return;
    }

    if (password.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }

    if (
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/\d/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      setError('Password must include an uppercase letter, lowercase letter, number, and special symbol.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. The link may have expired or was already used.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-[490px] bg-white rounded-[32px] sm:rounded-[36px] border border-white/90 shadow-[0_24px_50px_-12px_rgba(15,23,42,0.12),0_10px_24px_-6px_rgba(37,99,235,0.08),0_0_1px_1px_rgba(255,255,255,1)] p-8 sm:p-11 space-y-6 relative z-10">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 font-sans">
            INVALID REQUEST
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 m-0 pt-0.5">
            <ShieldAlert size={28} className="text-rose-600 shrink-0" />
            <span>No reset token provided</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 m-0 pt-1 leading-relaxed">
            The password recovery link appears to be missing or truncated.
          </p>
        </div>

        <div className="pt-2">
          <Button asChild className="w-full h-12 rounded-xl text-sm font-semibold justify-center">
            <Link href="/forgot-password">Request a new reset link</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[490px] bg-white rounded-[32px] sm:rounded-[36px] border border-white/90 shadow-[0_24px_50px_-12px_rgba(15,23,42,0.12),0_10px_24px_-6px_rgba(37,99,235,0.08),0_0_1px_1px_rgba(255,255,255,1)] p-8 sm:p-11 space-y-6 relative z-10">
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={14} /> Back to sign in
      </Link>

      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-sans">
          ACCOUNT SECURITY
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight m-0 pt-0.5">
          Set a new password
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 m-0 pt-0.5">
          Choose a secure passphrase that meets your university network security standards.
        </p>
      </div>

      {success ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span>Password updated successfully</span>
            </div>
            <p className="m-0 text-slate-600 leading-relaxed">
              Your account password has been updated and all previous active sessions have been revoked for your safety.
            </p>
          </div>

          <Button asChild className="w-full h-12 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 justify-center">
            <Link href="/login">Sign in with your new password</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <PasswordInput
            label="New password *"
            placeholder="Min. 12 characters with upper, lower, number, symbol"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <PasswordInput
            label="Confirm new password *"
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 justify-center gap-2"
          >
            <Lock size={16} />
            <span>{isSubmitting ? 'Updating credentials…' : 'Save new password'}</span>
          </Button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-medium">Loading reset form…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
