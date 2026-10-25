'use client';

import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { resetPassword } from '@/lib/api/auth.api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      <section className="auth-card">
        <p className="eyebrow" style={{ color: '#dc2626' }}>INVALID REQUEST</p>
        <h1>No reset token provided</h1>
        <p>The password recovery link appears to be missing or truncated.</p>
        <Button asChild style={{ marginTop: '1.5rem' }}>
          <Link href="/forgot-password">Request a new reset link</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="auth-card">
      <Link href="/login" className="back-link" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
        <ArrowLeft size={16} /> Back to sign in
      </Link>

      <p className="eyebrow">ACCOUNT SECURITY</p>
      <h1>Set a new password</h1>
      <p>Choose a secure passphrase that meets your university network security standards.</p>

      {success ? (
        <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
          <div
            style={{
              padding: '1.25rem',
              borderRadius: '8px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <CheckCircle2 size={18} />
              Password updated successfully
            </div>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem' }}>
              Your account password has been updated and all previous active sessions have been revoked for your safety.
            </p>
          </div>

          <Button asChild style={{ marginTop: '0.5rem' }}>
            <Link href="/login">Sign in with your new password</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <Input
              label="New password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 12 characters with upper, lower, number, symbol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '38px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--muted, #666)',
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Input
            label="Confirm new password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          {error ? <FormAlert>{error}</FormAlert> : null}

          <Button type="submit" className="auth-card__submit" disabled={isSubmitting}>
            <Lock size={16} /> {isSubmitting ? 'Updating credentials…' : 'Save new password'}
          </Button>
        </form>
      )}
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p style={{ padding: '2rem' }}>Loading reset form…</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
