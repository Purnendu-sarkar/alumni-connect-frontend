'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { login } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth-store';
import { getAuthErrorMessage } from './auth-error';
import { loginSchema, type LoginValues } from './auth.schemas';

export function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const submit = async (values: LoginValues) => {
    setFormError(null);
    try {
      const response = await login(values);
      if (!response.data) throw new Error('Your session could not be created.');
      setSession(response.data);
      router.replace('/dashboard');
    } catch (error) { setFormError(getAuthErrorMessage(error)); }
  };
  return <section className="auth-card"><p className="eyebrow">WELCOME BACK</p><h1>Continue the conversation.</h1><p>Sign in to reconnect with your university network.</p><form onSubmit={handleSubmit(submit)} noValidate><Input label="University email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} /><Input label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />{formError ? <FormAlert>{formError}</FormAlert> : null}<Button type="submit" className="auth-card__submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign in'}</Button></form><p className="auth-card__switch">New to the network? <Link href="/register">Create your profile.</Link></p></section>;
}
