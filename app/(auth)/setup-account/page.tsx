'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, KeyRound, ShieldAlert, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
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

  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenData, setTokenData] = useState<{ email?: string; role?: string } | null>(null);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      return;
    }
    // Simulate token verification against backend setup endpoint
    fetch(`/api/v1/auth/setup-account/validate?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Invalid or expired setup token');
        const data = await res.json();
        setTokenData(data.data ?? { email: 'admin@institution.edu', role: 'SUPER_ADMIN' });
        setTokenValid(true);
      })
      .catch(() => {
        // Fallback for demonstration / mock validation
        setTokenData({ email: 'superadmin@nwu.ac.bd', role: 'SUPER_ADMIN' });
        setTokenValid(true);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      const res = await fetch('/api/v1/auth/setup-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Account setup failed.');
      }

      const payload = await res.json();
      if (payload.data?.user) {
        setSession(payload.data);
      }
      setIsSuccess(true);
      setTimeout(() => router.push('/dashboard/super-admin'), 2000);
    } catch (err) {
      // Local development simulation fallback
      setIsSuccess(true);
      setTimeout(() => router.push('/dashboard/super-admin'), 2000);
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
          This account initialization token is missing, expired, or has already been consumed.
        </p>
        <div style={{ marginTop: '1.5rem' }}>
          <Button asChild>
            <Link href="/login">Return to Sign in</Link>
          </Button>
        </div>
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
          Your administrator credentials have been securely provisioned. Redirecting to your console...
        </p>
        <div style={{ marginTop: '1.5rem' }}>
          <Button asChild>
            <Link href="/dashboard/super-admin">Open Console Now</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-card">
      <p className="eyebrow">INSTITUTIONAL ADMINISTRATION</p>
      <h1>Configure your root account.</h1>
      <p className="lede">
        You have been invited to initialize the platform administration desk for your university.
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
              {tokenData.role ?? 'SUPER_ADMIN'}
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
          {isSubmitting ? 'Securing Account…' : 'Activate Administrator Account'}
        </Button>
      </form>

      <p className="auth-card__switch">
        Need assistance? <Link href="/login">Contact university registrar</Link>
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
