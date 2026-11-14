'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Info, LogIn, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { demoLogin, getDemoCapabilities, login, type DemoCapabilities } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';
import { getAuthErrorMessage } from './auth-error';
import { loginSchema, type LoginValues } from './auth.schemas';

const DEFAULT_DEMO_ROLES: Array<{ role: UserRole; label: string; email: string }> = [
  { role: 'STUDENT', label: 'Student', email: 'demo.student@demo.edu' },
  { role: 'ALUMNI', label: 'Alumni', email: 'demo.alumni@demo.edu' },
  { role: 'MODERATOR', label: 'Moderator', email: 'demo.moderator@demo.edu' },
  { role: 'SUPER_ADMIN', label: 'Super Admin', email: 'demo.superadmin@demo.edu' },
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

  // Demo capability state
  const [demoCapabilities, setDemoCapabilities] = useState<DemoCapabilities | null>({
    enabled: true,
    environment: 'development',
    roles: DEFAULT_DEMO_ROLES,
  });
  const [loggingInRole, setLoggingInRole] = useState<UserRole | null>(null);
  const [demoError, setDemoError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.replace(getRoleHome(user.role));
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
        // Retain default development demo buttons if backend isn't responding
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

  const handleDemoLogin = async (role: UserRole) => {
    setDemoError(null);
    setLoggingInRole(role);
    try {
      queryClient.clear();
      const response = await demoLogin(role);
      if (!response.data) throw new Error('Demo session could not be created.');
      setSession(response.data);
      router.replace(getRoleHome(role));
    } catch (error) {
      setDemoError(getAuthErrorMessage(error));
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

      {/* Development Demo Access matching Screenshot 3 */}
      {demoCapabilities?.enabled && demoCapabilities.roles?.length ? (
        <div className="rounded-2xl bg-blue-50/70 border border-blue-100/90 p-4 space-y-2.5">
          <div className="flex items-start gap-2">
            <div className="p-1 rounded-md bg-blue-600/10 text-blue-600 shrink-0 mt-0.5">
              <Info size={14} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 m-0">Development Demo Access</p>
              <p className="text-[11px] text-slate-500 m-0">Quick login for testing purposes:</p>
            </div>
          </div>

          {demoError ? (
            <Alert variant="destructive">
              <AlertDescription>{demoError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid grid-cols-2 gap-2 pt-1">
            {demoCapabilities.roles.map((item) => {
              const isCurrent = loggingInRole === item.role;
              return (
                <button
                  key={item.role}
                  id={`demo-login-${item.role.toLowerCase().replace('_', '-')}`}
                  type="button"
                  onClick={() => handleDemoLogin(item.role)}
                  disabled={Boolean(loggingInRole) || isSubmitting}
                  className={`px-3 py-2 rounded-xl border text-left transition-all duration-150 flex items-center justify-between gap-2 cursor-pointer shadow-2xs ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white hover:bg-blue-50/80 hover:border-blue-200 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          item.role === 'SUPER_ADMIN'
                            ? '#7c3aed'
                            : item.role === 'MODERATOR'
                            ? '#d97706'
                            : item.role === 'ALUMNI'
                            ? '#16a34a'
                            : '#2563eb',
                      }}
                    />
                    <span className="text-xs font-semibold truncate">
                      {isCurrent ? 'Logging in…' : item.label}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono shrink-0 ${isCurrent ? 'text-white/80' : 'text-slate-400'}`}>
                    {item.role === 'SUPER_ADMIN' ? 'admin' : item.role === 'MODERATOR' ? 'mod' : item.role === 'ALUMNI' ? 'alumni' : 'student'}
                  </span>
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
