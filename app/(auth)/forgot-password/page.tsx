'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, KeyRound, Mail } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { forgotPassword } from '@/lib/api/auth.api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugUrl, setDebugUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await forgotPassword(email.trim());
      setSubmitted(true);
      if (response.data?.resetUrl) {
        setDebugUrl(response.data.resetUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to request password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          RECOVER ACCESS
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight m-0 pt-0.5">
          Reset your password
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 m-0 pt-0.5">
          Enter your university or account email address to receive password recovery instructions.
        </p>
      </div>

      {submitted ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span>Recovery link dispatched</span>
            </div>
            <p className="m-0 text-slate-600 leading-relaxed">
              If an account is associated with <strong className="text-slate-900">{email}</strong>, a secure single-use reset link has been
              sent. The link expires in 15 minutes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-600 space-y-2">
            <strong className="text-slate-800">Local Academic / Viva Testing:</strong>
            <p className="m-0 leading-relaxed">
              • If Mailpit is running, view the email in Mailpit Web UI at{' '}
              <a href="http://localhost:8025" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">
                http://localhost:8025
              </a>
              .<br />
              • Or check backend console logs for the captured link.
            </p>

            {debugUrl ? (
              <div className="pt-1">
                <Button asChild variant="secondary" className="w-full h-10 rounded-xl text-xs font-semibold justify-center gap-2">
                  <a href={debugUrl}>
                    <KeyRound size={15} /> Open Reset Password Screen
                  </a>
                </Button>
              </div>
            ) : null}
          </div>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500 m-0">
              Remembered your password?{' '}
              <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Account email address *"
            type="email"
            placeholder="your.email@example.edu"
            leftIcon={<Mail size={18} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
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
            <Mail size={16} />
            <span>{isSubmitting ? 'Sending instructions…' : 'Send reset link'}</span>
          </Button>

          <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 m-0">
            Remembered your credentials?{' '}
            <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700">
              Return to login
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
