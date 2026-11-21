'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, LogIn, Mail, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import {
  getQuickAccessProfiles,
  login,
  quickAccessLogin,
  type QuickAccessCapabilities,
} from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';
import { getAuthErrorMessage } from './auth-error';
import { loginSchema, type LoginValues } from './auth.schemas';

const DEFAULT_SHOWCASE_ROLES: Array<{
  role: UserRole;
  label: string;
  name: string;
  subtitle: string;
}> = [
  { role: 'SUPER_ADMIN', label: 'Super Admin', name: 'Platform Super Admin', subtitle: 'Platform Governance' },
  { role: 'MODERATOR', label: 'Moderator', name: 'Kazi Moinul Islam', subtitle: 'CSE Faculty & Moderator' },
  { role: 'ALUMNI', label: 'Alumni', name: 'Arif Gazi', subtitle: "BBA '16 · HRBP" },
  { role: 'STUDENT', label: 'Student', name: 'Soumya Miah', subtitle: "CSE '22 · 8th Sem" },
];

function getRoleHome(role?: UserRole): string {
  switch (role) {
    case 'STUDENT':
      return '/student/dashboard';
    case 'ALUMNI':
      return '/alumni/dashboard';
    case 'MODERATOR':
      return '/moderator/dashboard';
    case 'SUPER_ADMIN':
      return '/admin/dashboard';
    default:
      return '/dashboard';
  }
}

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const [formError, setFormError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const reason = params.get('reason');
      if (reason === 'password_changed') {
        setInfoMessage('Your password has been changed successfully. Please sign in with your new credentials.');
      } else if (reason === 'reset_completed') {
        setInfoMessage('Your password has been reset successfully. Please sign in with your new password.');
      } else if (reason === 'session_expired') {
        setInfoMessage('Your session has expired. Please sign in again.');
      }
    }
  }, []);

  // Quick-access showcase capability state
  const [showcaseCapabilities, setShowcaseCapabilities] = useState<QuickAccessCapabilities | null>({
    enabled: true,
    environment: 'development',
    profiles: [],
    roles: DEFAULT_SHOWCASE_ROLES.map((r) => ({ role: r.role, label: r.label, email: '' })),
  });
  const [loggingInRole, setLoggingInRole] = useState<UserRole | null>(null);
  const [quickAccessError, setQuickAccessError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.replace(getRoleHome(user.role));
    }
  }, [user, router]);

  useEffect(() => {
    let isMounted = true;
    getQuickAccessProfiles()
      .then((res) => {
        if (isMounted && res.data?.enabled) {
          setShowcaseCapabilities(res.data);
        }
      })
      .catch(() => {
        // Retain default development showcase buttons if backend is unreachable
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
      router.replace(getRoleHome(response.data.user.role));
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    }
  };

  const handleQuickAccessLogin = async (role: UserRole) => {
    setQuickAccessError(null);
    setLoggingInRole(role);
    try {
      queryClient.clear();
      const response = await quickAccessLogin(role);
      if (!response.data) throw new Error('Showcase session could not be created.');
      setSession(response.data);
      router.replace(getRoleHome(role));
    } catch (error) {
      setQuickAccessError(getAuthErrorMessage(error));
    } finally {
      setLoggingInRole(null);
    }
  };

  return (
    <div className="relative w-full max-w-[490px]">
      {/* Ambient soft shadow glow behind credential card */}
      <div className="absolute inset-1 sm:inset-3 rounded-[38px] bg-gradient-to-b from-blue-500/15 via-indigo-400/10 to-sky-400/20 blur-2xl -z-10 pointer-events-none translate-y-3" />

      <div className="w-full bg-white rounded-[32px] sm:rounded-[36px] border border-white/90 shadow-[0_24px_50px_-12px_rgba(15,23,42,0.12),0_10px_24px_-6px_rgba(37,99,235,0.08),0_0_1px_1px_rgba(255,255,255,1)] p-8 sm:p-11 space-y-6 relative z-10 transition-all">
      {/* Header matching Screenshot 3 */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight m-0">
          Welcome Back
        </h1>
        <p className="text-base font-semibold text-slate-700 m-0 pt-0.5">
          Continue the conversation.
        </p>
        <p className="text-xs sm:text-sm text-slate-500 m-0">
          Sign in to reconnect with your alumni network, mentors, and campus opportunities.
        </p>
      </div>

      {infoMessage ? (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{infoMessage}</span>
        </div>
      ) : null}

      {/* Form Fields */}
      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="you@university.edu"
          leftIcon={<Mail size={18} />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="space-y-1.5">
          <PasswordInput
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex justify-end pt-0.5">
            <Link
              href="/forgot-password"
              className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        {formError ? (
          <Alert variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}

        <Button
          type="submit"
          className="w-full h-12 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25 justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
          disabled={isSubmitting || Boolean(loggingInRole)}
        >
          <LogIn size={18} />
          <span>{isSubmitting ? 'Signing in…' : 'Sign In to Campus Desk'}</span>
        </Button>
      </form>

      <div className="text-center pt-1 border-t border-slate-100">
        <p className="text-xs text-slate-500 m-0">
          New to the network?{' '}
          <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
            Create your account
          </Link>
        </p>
      </div>

      {/* Quick Role Access Gateway */}
      {showcaseCapabilities?.enabled ? (
        <div className="rounded-2xl bg-slate-50/90 border border-slate-200/90 p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-600/10 text-blue-600 shrink-0 mt-0.5">
              <Sparkles size={15} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 m-0">Quick Role Access</p>
              <p className="text-[11px] text-slate-500 m-0">One-click role login for live platform overview:</p>
            </div>
          </div>

          {quickAccessError ? (
            <Alert variant="destructive">
              <AlertDescription>{quickAccessError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            {DEFAULT_SHOWCASE_ROLES.map((defaultItem) => {
              const liveProfile = showcaseCapabilities.profiles?.find((p) => p.role === defaultItem.role);
              const displayName = liveProfile?.name || defaultItem.name;
              const displaySubtitle = liveProfile?.designation || defaultItem.subtitle;
              const isCurrent = loggingInRole === defaultItem.role;

              return (
                <button
                  key={defaultItem.role}
                  id={`quick-login-${defaultItem.role.toLowerCase().replace('_', '-')}`}
                  type="button"
                  onClick={() => void handleQuickAccessLogin(defaultItem.role)}
                  disabled={Boolean(loggingInRole) || isSubmitting}
                  className={`px-3 py-2.5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between gap-1.5 cursor-pointer shadow-2xs ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white hover:bg-blue-50/80 hover:border-blue-200 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            defaultItem.role === 'SUPER_ADMIN'
                              ? '#7c3aed'
                              : defaultItem.role === 'MODERATOR'
                              ? '#d97706'
                              : defaultItem.role === 'ALUMNI'
                              ? '#16a34a'
                              : '#2563eb',
                        }}
                      />
                      <span className={`text-[11px] font-bold uppercase tracking-wider truncate ${isCurrent ? 'text-white' : 'text-slate-700'}`}>
                        {defaultItem.label}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md shrink-0 ${
                        isCurrent
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {defaultItem.role === 'SUPER_ADMIN'
                        ? 'admin'
                        : defaultItem.role === 'MODERATOR'
                        ? 'mod'
                        : defaultItem.role === 'ALUMNI'
                        ? 'alumni'
                        : 'student'}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate m-0 ${isCurrent ? 'text-white' : 'text-slate-900'}`}>
                      {isCurrent ? 'Authenticating…' : displayName}
                    </p>
                    <p
                      className={`text-[10px] truncate m-0 ${
                        isCurrent ? 'text-white/80' : 'text-slate-500'
                      }`}
                    >
                      {displaySubtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      </div>
    </div>
  );
}
