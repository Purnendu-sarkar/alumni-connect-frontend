'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
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
          router.push('/dashboard/super-admin');
        } else if (session?.user?.role === 'MODERATOR') {
          router.push('/dashboard/moderator');
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
      <section className="auth-card">
        <p className="eyebrow eyebrow--red">ACCESS RESTRICTED</p>
        <h1>Invalid setup token.</h1>
        <p className="lede">
          {tokenErrorMessage || 'This account initialization token is missing, expired, or has already been consumed.'}
        </p>
        <div style={{ marginTop: '1.5rem' }}>
          <Button asChild>
            <Link href="/login">Return to Sign in</Link>
          </Button>
        </div>
      </section>
    );
  }

  if (tokenValid === null) {
    return (
      <section className="auth-card">
        <p className="eyebrow">VERIFYING INVITATION</p>
        <h1>Validating token…</h1>
        <p className="lede">Please wait while we verify your invitation credentials with the server.</p>
      </section>
    );
  }

  if (isSuccess) {
    return (
      <section className="auth-card">
        <p className="eyebrow" style={{ color: '#16a34a' }}>INITIALIZATION COMPLETE</p>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle2 size={36} color="#16a34a" /> Welcome aboard.
        </h1>
        <p className="lede">
          Your credentials have been securely activated. Redirecting to your dashboard…
        </p>
        <div style={{ marginTop: '1.5rem' }}>
          <Button asChild>
            <Link href={assignedRole === 'SUPER_ADMIN' ? '/dashboard/super-admin' : '/dashboard/moderator'}>
              Open Dashboard Now
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-card">
      <p className="eyebrow">STAFF & MODERATOR INVITATION</p>
      <h1>Configure your account.</h1>
      <p className="lede">
        You have been invited to join the platform administration desk for {tokenData?.university?.name || 'your university'}.
      </p>

      {tokenData?.email && (
        <div
          style={{
            padding: '0.85rem 1rem',
            background: 'var(--surface)',
            border: '2px solid var(--ink)',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
          }}
        >
          <p style={{ margin: 0, fontWeight: 700 }}>
            ASSIGNED EMAIL:{' '}
            <span style={{ fontWeight: 400, color: 'var(--muted)' }}>{tokenData.email}</span>
          </p>
          <p style={{ margin: '0.25rem 0 0', fontWeight: 700 }}>
            ROLE ASSIGNMENT:{' '}
            <span style={{ fontWeight: 400, color: 'var(--muted)' }}>
              {tokenData.role ?? assignedRole}
            </span>
          </p>
        </div>
      )}

      {error && <FormAlert>{error}</FormAlert>}

      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Full Name"
          placeholder="e.g. Dr. Shamsul Haque"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="New Password (min 8 characters)"
          type="password"
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" disabled={isSubmitting} style={{ width: '100%', marginTop: '1rem' }}>
          {isSubmitting ? 'Securing Account…' : 'Activate Account'}
        </Button>
      </form>

      <p className="auth-card__switch">
        Need assistance? <Link href="/login">Contact administrator</Link>
      </p>
    </section>
  );
}

export default function SetupAccountPage() {
  return (
    <Suspense fallback={<div className="page-shell"><p className="eyebrow">LOADING SETUP...</p></div>}>
      <SetupAccountContent />
    </Suspense>
  );
}
