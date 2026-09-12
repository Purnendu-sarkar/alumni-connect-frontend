'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth-store';

const loginSchema = z.object({ email: z.email('Use a valid email address.'), password: z.string().min(1, 'Enter your password.') });
type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>();

  const submit = async (values: LoginValues) => {
    setFormError(null);
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) return;
    try {
      const response = await login(parsed.data);
      if (!response.data) throw new Error('Your session could not be created.');
      setSession(response.data);
      router.push('/dashboard');
    } catch (error) { setFormError(error instanceof Error ? error.message : 'Unable to sign in right now.'); }
  };

  return <section className="auth-card"><p className="eyebrow">WELCOME BACK</p><h1>Continue the conversation.</h1><p>Sign in to reconnect with your university network.</p><form onSubmit={handleSubmit(submit)} noValidate><Input label="University email" type="email" autoComplete="email" error={errors.email?.message} {...register('email', { required: 'Your email is required.' })} /><Input label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password', { required: 'Your password is required.' })} />{formError ? <p className="form-alert" role="alert">{formError}</p> : null}<Button type="submit" className="auth-card__submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign in'}</Button></form><p className="auth-card__switch">New to the network? <Link href="/register">Create your profile.</Link></p></section>;
}
