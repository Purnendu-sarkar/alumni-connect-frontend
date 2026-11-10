'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  const [showPassword, setShowPassword] = useState(false);

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
    <Card className="p-6 sm:p-8 space-y-6">
      <CardHeader className="p-0 space-y-1.5">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-mono">
          WELCOME BACK
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight m-0">
          Continue the conversation.
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 m-0">
          Sign in to reconnect with your alumni network, mentors, and campus opportunities.
        </p>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="your.email@demo.edu"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8.5 p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {formError ? (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          <Button
            type="submit"
            className="w-full justify-center font-bold"
            size="default"
            disabled={isSubmitting || Boolean(loggingInRole)}
          >
            {isSubmitting ? 'Signing in…' : 'Sign In to Campus Desk'}
          </Button>
        </form>
      </CardContent>

      <div className="text-center pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-500 m-0">
          New to the network?{' '}
          <Link href="/register" className="font-bold text-blue-600 hover:text-blue-800 transition-colors">
            Create your account
          </Link>
        </p>
      </div>

      {/* Development Demo Access using shadcn Card */}
      {demoCapabilities?.enabled && demoCapabilities.roles?.length ? (
        <div className="pt-6 border-t border-slate-200 space-y-3">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 font-mono">
              DEVELOPMENT DEMO ACCESS
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed m-0">
            Instantly test role-specific workflows with pre-seeded sandbox accounts. No credentials required.
          </p>

          {demoError ? (
            <Alert variant="destructive">
              <AlertDescription>{demoError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {demoCapabilities.roles.map((item) => {
              const isCurrent = loggingInRole === item.role;
              return (
                <button
                  key={item.role}
                  id={`demo-login-${item.role.toLowerCase().replace('_', '-')}`}
                  type="button"
                  onClick={() => handleDemoLogin(item.role)}
                  disabled={Boolean(loggingInRole) || isSubmitting}
                  className={`p-2.5 rounded-xl border text-left transition-all duration-150 flex items-center justify-between gap-2 cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-slate-50 hover:bg-white hover:border-slate-300 border-slate-200'
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
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {isCurrent ? `Logging in…` : item.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {item.role.toLowerCase().replace('_', '-')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
