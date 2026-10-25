'use client';

import { ArrowLeft, CheckCircle2, KeyRound, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
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
    <section className="auth-card">
      <Link href="/login" className="back-link" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
        <ArrowLeft size={16} /> Back to sign in
      </Link>

      <p className="eyebrow">RECOVER ACCESS</p>
      <h1>Reset your password</h1>
      <p>Enter your university or account email address to receive password recovery instructions.</p>

      {submitted ? (
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
              Recovery link dispatched
            </div>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', lineHeight: 1.5 }}>
              If an account is associated with <strong>{email}</strong>, a secure single-use reset link has been
              sent. The link expires in 15 minutes.
            </p>
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              fontSize: '0.85rem',
              color: '#475569',
            }}
          >
            <strong>Local Academic / Viva Testing:</strong>
            <p style={{ margin: '0.25rem 0 0' }}>
              • If Mailpit is running, view the email in Mailpit Web UI at{' '}
              <a href="http://localhost:8025" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                http://localhost:8025
              </a>
              .<br />
              • Or check backend console logs for the captured link.
            </p>

            {debugUrl ? (
              <div style={{ marginTop: '0.75rem' }}>
                <Button asChild variant="secondary" style={{ width: '100%' }}>
                  <a href={debugUrl}>
                    <KeyRound size={16} /> Open Reset Password Screen
                  </a>
                </Button>
              </div>
            ) : null}
          </div>

          <p className="auth-card__switch">
            Remembered your password? <Link href="/login">Sign in here.</Link>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
          <Input
            label="Account email address"
            type="email"
            placeholder="your.email@example.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          {error ? <FormAlert>{error}</FormAlert> : null}

          <Button type="submit" className="auth-card__submit" disabled={isSubmitting}>
            <Mail size={16} /> {isSubmitting ? 'Sending instructions…' : 'Send reset link'}
          </Button>

          <p className="auth-card__switch">
            Remembered your credentials? <Link href="/login">Return to login.</Link>
          </p>
        </form>
      )}
    </section>
  );
}
