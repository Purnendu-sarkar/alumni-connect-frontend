'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { register as registerAccount } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth-store';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name.'),
  email: z.email('Use a valid email address.'),
  password: z.string().min(12, 'Use at least 12 characters.'),
  role: z.enum(['STUDENT', 'ALUMNI']),
});
type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterValues>({ defaultValues: { role: 'STUDENT' } });
  const submit = async (values: RegisterValues) => {
    setFormError(null);
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) return;
    try {
      const response = await registerAccount({ ...parsed.data, universitySlug: 'demo-university' });
      if (!response.data) throw new Error('Your profile could not be created.');
      setSession(response.data);
      router.push('/dashboard');
    } catch (error) { setFormError(error instanceof Error ? error.message : 'Unable to create your profile right now.'); }
  };

  return <section className="auth-card"><p className="eyebrow">OPEN YOUR DOOR</p><h1>Be part of the record.</h1><p>Create a verified profile to meet mentors, peers, and opportunity.</p><form onSubmit={handleSubmit(submit)} noValidate><Input label="Full name" autoComplete="name" error={errors.name?.message} {...register('name', { required: 'Your name is required.' })} /><Input label="University email" type="email" autoComplete="email" error={errors.email?.message} {...register('email', { required: 'Your email is required.' })} /><Input label="Password" type="password" autoComplete="new-password" hint="At least 12 characters." error={errors.password?.message} {...register('password', { required: 'A password is required.' })} /><label className="field"><span className="field__label">I am joining as</span><select className="field__input" {...register('role')}><option value="STUDENT">A current student</option><option value="ALUMNI">An alumnus or alumna</option></select></label>{formError ? <p className="form-alert" role="alert">{formError}</p> : null}<Button type="submit" className="auth-card__submit" disabled={isSubmitting}>{isSubmitting ? 'Creating profile…' : 'Create profile'}</Button></form><p className="auth-card__switch">Already have an account? <Link href="/login">Sign in.</Link></p></section>;
}
