'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { demoLogin, getDemoCapabilities, login, type DemoCapabilities } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';
import { getAuthErrorMessage } from './auth-error';
import { loginSchema, type LoginValues } from './auth.schemas';

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Demo capability state
  const [demoCapabilities, setDemoCapabilities] = useState<DemoCapabilities | null>(null);
  const [loggingInRole, setLoggingInRole] = useState<UserRole | null>(null);
  const [demoError, setDemoError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    let isMounted = true;
    getDemoCapabilities()
      .then((res) => {
        if (isMounted && res.data?.enabled) {
          setDemoCapabilities(res.data);
        }
      })
      .catch(() => {
        // Silently ignore if demo capabilities are disabled/unavailable
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const submit = async (values: LoginValues) => {
    setFormError(null);
    try {
      queryClient.clear();
      const response = await login(values);
      if (!response.data) throw new Error('Your session could not be created.');
      setSession(response.data);
      router.replace('/dashboard');
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setDemoError(null);
    setLoggingInRole(role);
    try {
      queryClient.clear();
      const response = await demoLogin(role);
      if (!response.data) throw new Error('Demo session could not be created.');
      setSession(response.data);
      router.replace('/dashboard');
    } catch (error) {
      setDemoError(getAuthErrorMessage(error));
    } finally {
      setLoggingInRole(null);
    }
  };

  return (
    <section className="auth-card">
      <p className="eyebrow">WELCOME BACK</p>
      <h1>Continue the conversation.</h1>
      <p>Sign in to reconnect with your university network.</p>

      <form onSubmit={handleSubmit(submit)} noValidate>
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="your.email@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div style={{ position: 'relative' }}>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem', marginBottom: '0.75rem' }}>
          <Link href="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--muted, #666)', textDecoration: 'underline' }}>
            Forgot password?
          </Link>
        </div>

        {formError ? <FormAlert>{formError}</FormAlert> : null}

        <Button type="submit" className="auth-card__submit" disabled={isSubmitting || Boolean(loggingInRole)}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="auth-card__switch">
        New to the network? <Link href="/register">Create your profile.</Link>
      </p>

      {/* Development Demo Access */}
      {demoCapabilities?.enabled && demoCapabilities.roles?.length ? (
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border, #e5e5e5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Sparkles size={16} style={{ color: '#d97706' }} />
            <p className="eyebrow" style={{ margin: 0, color: '#b45309' }}>
              DEVELOPMENT DEMO ACCESS
            </p>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--muted, #666)', margin: '0 0 1rem', lineHeight: 1.4 }}>
            Instantly test role-specific workflows with pre-seeded sandbox accounts. No passwords required.
          </p>

          {demoError ? <FormAlert>{demoError}</FormAlert> : null}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
            {demoCapabilities.roles.map((item) => {
              const isCurrent = loggingInRole === item.role;
              return (
                <button
                  key={item.role}
                  id={`demo-login-${item.role.toLowerCase().replace('_', '-')}`}
                  type="button"
                  onClick={() => handleDemoLogin(item.role)}
                  disabled={Boolean(loggingInRole) || isSubmitting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.625rem 0.875rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border, #d1d5db)',
                    background: isCurrent ? '#f3f4f6' : '#fff',
                    cursor: loggingInRole ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--foreground, #111827)',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                  }}
                  onMouseOver={(e) => {
                    if (!loggingInRole) {
                      e.currentTarget.style.borderColor = '#9ca3af';
                      e.currentTarget.style.background = '#f9fafb';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loggingInRole) {
                      e.currentTarget.style.borderColor = 'var(--border, #d1d5db)';
                      e.currentTarget.style.background = '#fff';
                    }
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor:
                          item.role === 'SUPER_ADMIN'
                            ? '#7c3aed'
                            : item.role === 'ADMIN'
                            ? '#2563eb'
                            : item.role === 'MODERATOR'
                            ? '#d97706'
                            : item.role === 'ALUMNI'
                            ? '#16a34a'
                            : '#0284c7',
                      }}
                    />
                    {isCurrent ? `Signing in as ${item.label}…` : `Continue as ${item.label}`}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {item.role.toLowerCase().replace('_', '-')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
