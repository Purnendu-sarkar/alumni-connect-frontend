'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { register as registerAccount } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth-store';
import { getAuthErrorMessage } from './auth-error';
import { registerSchema, type RegisterValues } from './auth.schemas';

export function RegisterForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { role: 'STUDENT', universitySlug: process.env.NEXT_PUBLIC_UNIVERSITY_SLUG ?? '' } });
  const role = watch('role');
  const submit = async ({ confirmPassword: _confirmPassword, ...values }: RegisterValues) => {
    setFormError(null);
    try {
      const response = await registerAccount(Object.fromEntries(Object.entries(values).filter(([, value]) => value !== '')) as Omit<RegisterValues, 'confirmPassword'>);
      if (!response.data) throw new Error('Your profile could not be created.');
      setSession(response.data);
      router.replace('/dashboard');
    } catch (error) { setFormError(getAuthErrorMessage(error)); }
  };
  return <section className="auth-card"><p className="eyebrow">OPEN YOUR DOOR</p><h1>Be part of the record.</h1><p>Students and alumni may register here. Staff accounts are issued by a university administrator.</p><form onSubmit={handleSubmit(submit)} noValidate><Input label="Full name" autoComplete="name" error={errors.name?.message} {...register('name')} /><Input label="University email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} /><Input label="University code" autoComplete="organization" hint="Example: demo-university" error={errors.universitySlug?.message} {...register('universitySlug')} /><label className="field"><span className="field__label">I am joining as</span><select className="field__input" {...register('role')}><option value="STUDENT">A current student</option><option value="ALUMNI">An alumnus or alumna</option></select></label><div className="auth-card__grid"><Input label="Batch / graduation year" error={errors.batch?.message} {...register('batch')} /><Input label="Department" error={errors.department?.message} {...register('department')} /></div>{role === 'ALUMNI' ? <div className="auth-card__grid"><Input label="Current company" autoComplete="organization" error={errors.currentCompany?.message} {...register('currentCompany')} /><Input label="Job title" autoComplete="organization-title" error={errors.position?.message} {...register('position')} /></div> : null}<Input label="Password" type="password" autoComplete="new-password" hint="12+ characters, uppercase, lowercase, number, and symbol." error={errors.password?.message} {...register('password')} /><Input label="Confirm password" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />{formError ? <FormAlert>{formError}</FormAlert> : null}<Button type="submit" className="auth-card__submit" disabled={isSubmitting}>{isSubmitting ? 'Creating profile…' : 'Create profile'}</Button></form><p className="auth-card__switch">Already have an account? <Link href="/login">Sign in.</Link></p></section>;
}
