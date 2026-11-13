'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';

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
      <section className="auth-card">
        <p className="eyebrow">SECURITY VERIFICATION</p>
        <h1>Confirming your credentials…</h1>
        <p className="lede">Verifying your institutional email address against campus directory records.</p>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className="auth-card">
        <p className="eyebrow eyebrow--red">VERIFICATION EXPIRED OR INVALID</p>
        <h1>Link is no longer valid.</h1>
        <p className="lede">{errorMessage || 'This verification link has expired or was already verified.'}</p>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/register">Register Again</Link>
          </Button>
        </div>
      </section>
    );
  }

  const isAlumni = resolvedRole === 'ALUMNI';

  return (
    <section className="auth-card">
      <p className="eyebrow" style={{ color: isAlumni ? '#d97706' : '#16a34a' }}>
        {isAlumni ? 'EMAIL VERIFIED — ACCREDITATION PENDING' : 'EMAIL CONFIRMED — ACCOUNT ACTIVATED'}
      </p>

      {isAlumni ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Clock size={38} color="#d97706" />
            <h1 style={{ margin: 0 }}>Under Administrative Verification.</h1>
          </div>
          <p className="lede">
            Your university institutional email is confirmed! As a graduate, your alumni status has been queued for verification by the university administration to safeguard student mentorship integrity.
          </p>

          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              border: '2px solid var(--ink)',
              background: 'var(--surface)',
            }}
          >
            <p className="eyebrow" style={{ color: 'var(--ink)' }}>WHAT HAPPENS NEXT?</p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', lineHeight: '1.6' }}>
              <li>University administration reviews your graduation batch, department, and academic records.</li>
              <li>You will receive an official approval email once accredited.</li>
              <li>After approval, you can sign in to access the Alumni Desk and mentor students.</li>
            </ul>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <Button asChild>
              <Link href="/login">Return to Sign in <ArrowUpRight size={16} /></Link>
            </Button>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <CheckCircle2 size={38} color="#16a34a" />
            <h1 style={{ margin: 0 }}>Account Activated.</h1>
          </div>
          <p className="lede">
            Welcome to the verified university network. Your email is verified and your account is ready to sign in.
          </p>

          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              border: '2px solid var(--ink)',
              background: 'var(--surface)',
            }}
          >
            <p className="eyebrow" style={{ color: 'var(--ink)' }}>UNLOCKED PRIVILEGES</p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', lineHeight: '1.6' }}>
              <li>Browse verified alumni by batch, department, and current company.</li>
              <li>Send structured mentorship requests to industry seniors.</li>
              <li>Apply directly to campus-exclusive internship and career openings.</li>
            </ul>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <Button asChild>
              <Link href="/login">Sign in Now <ArrowUpRight size={16} /></Link>
            </Button>
          </div>
        </>
      )}
    </section>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="page-shell"><p className="eyebrow">VERIFYING EMAIL...</p></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
