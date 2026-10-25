'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Eye, EyeOff, GraduationCap, School } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { register as registerAccount, type RegisterInput } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth-store';
import { getAuthErrorMessage } from './auth-error';
import { registerSchema, type RegisterValues } from './auth.schemas';

export function RegisterForm() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'STUDENT',
      universitySlug: process.env.NEXT_PUBLIC_UNIVERSITY_SLUG ?? 'demo-university',
      employmentStatus: 'Employed',
    },
  });

  const role = watch('role');
  const employmentStatus = watch('employmentStatus');

  const submit = async (values: RegisterValues) => {
    setFormError(null);
    try {
      const { confirmPassword, skills, interests, ...rest } = values;
      void confirmPassword;

      const payload: RegisterInput = {
        ...(Object.fromEntries(
          Object.entries(rest).filter(([, val]) => val !== '' && val !== undefined),
        ) as unknown as Omit<RegisterInput, 'skills' | 'interests'>),
        skills: skills ? skills.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        interests: interests ? interests.split(',').map((i) => i.trim()).filter(Boolean) : undefined,
      };

      const response = await registerAccount(payload);
      if (!response.data) throw new Error('Your profile could not be created.');

      setSession(response.data);
      router.replace('/dashboard/profile');
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    }
  };

  return (
    <section className="auth-card auth-card--register">
      <p className="eyebrow">OPEN YOUR DOOR</p>
      <h1>Be part of the record.</h1>
      <p className="auth-card__desc">
        Select your status and enter your academic details to join your university community.
      </p>

      {/* Role Selection Buttons - High Contrast, Zero Color Conflict */}
      <div className="auth-role-selector">
        <button
          type="button"
          onClick={() => setValue('role', 'STUDENT')}
          className={`auth-role-btn ${role === 'STUDENT' ? 'auth-role-btn--active' : ''}`}
          aria-pressed={role === 'STUDENT'}
        >
          <div className="auth-role-btn__icon">
            <School size={20} />
          </div>
          <div className="auth-role-btn__content">
            <span className="auth-role-btn__title">Current Student</span>
            <span className="auth-role-btn__desc">Mentorship & campus jobs</span>
          </div>
          <div className="auth-role-btn__check">
            <CheckCircle2 size={18} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setValue('role', 'ALUMNI')}
          className={`auth-role-btn ${role === 'ALUMNI' ? 'auth-role-btn--active' : ''}`}
          aria-pressed={role === 'ALUMNI'}
        >
          <div className="auth-role-btn__icon">
            <GraduationCap size={20} />
          </div>
          <div className="auth-role-btn__content">
            <span className="auth-role-btn__title">Graduate / Alumni</span>
            <span className="auth-role-btn__desc">Network, mentor & hire</span>
          </div>
          <div className="auth-role-btn__check">
            <CheckCircle2 size={18} />
          </div>
        </button>
      </div>

      <form onSubmit={handleSubmit(submit)} noValidate className="auth-form-grid">
        {/* Row 1: Full name & Email */}
        <Input
          label="Full name"
          autoComplete="name"
          placeholder="e.g. Sadia Rahman or পূর্ণেন্দু সরকার"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="your.email@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Row 2: University code & Department */}
        <Input
          label="University code"
          autoComplete="organization"
          placeholder="e.g. demo-university"
          error={errors.universitySlug?.message}
          {...register('universitySlug')}
        />

        <Input
          label="Department / Program"
          placeholder="e.g. CSE, EEE, BBA"
          error={errors.department?.message}
          {...register('department')}
        />

        {/* Row 3: Batch and Role-specific academic ID */}
        <Input
          label={role === 'STUDENT' ? 'Batch / Session' : 'Graduation / Passing Year'}
          placeholder={role === 'STUDENT' ? 'e.g. 2026 or 16th' : 'e.g. 2020'}
          error={errors.batch?.message}
          {...register('batch')}
        />

        {role === 'STUDENT' ? (
          <Input
            label="Student ID (Optional)"
            placeholder="e.g. 160101"
            error={errors.studentId?.message}
            {...register('studentId')}
          />
        ) : (
          <label className="field">
            <span className="field__label">Professional Status</span>
            <select className="field__input" {...register('employmentStatus')}>
              <option value="Employed">Currently Employed</option>
              <option value="Seeking opportunities">Seeking Opportunities / Looking for Work</option>
              <option value="Entrepreneur / Self-Employed">Entrepreneur / Self-Employed</option>
              <option value="Higher Studies / Research">Higher Studies / Researcher</option>
              <option value="Other">Other</option>
            </select>
          </label>
        )}

        {/* Row 4: Student semester or Alumni company details */}
        {role === 'STUDENT' ? (
          <div className="auth-form-field--full" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem 0.95rem' }}>
            <Input
              label="Current Semester / Year"
              placeholder="e.g. 8th Semester / Final Year"
              error={errors.currentSemester?.message}
              {...register('currentSemester')}
            />
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: 'var(--muted)', paddingTop: '1.1rem' }}>
              💡 Profile can be enriched with skills & interests later in dashboard.
            </div>
          </div>
        ) : (
          (employmentStatus === 'Employed' || employmentStatus === 'Entrepreneur / Self-Employed') ? (
            <>
              <Input
                label="Company / Organization"
                placeholder="e.g. Google, Pathao"
                error={errors.currentCompany?.message}
                {...register('currentCompany')}
              />
              <Input
                label="Job Title / Designation"
                placeholder="e.g. Software Engineer"
                error={errors.position?.message}
                {...register('position')}
              />
            </>
          ) : (
            <div className="auth-form-field--full" style={{ fontSize: '0.74rem', color: 'var(--muted)', padding: '0.2rem 0' }}>
              💡 Employment details are optional and can be updated anytime from your profile.
            </div>
          )
        )}

        {/* Row 5: Password and Confirm password side-by-side */}
        <div style={{ position: 'relative' }}>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '30px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted, #666)',
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <Input
            label="Confirm password"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '30px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted, #666)',
            }}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {formError ? (
          <div className="auth-form-field--full">
            <FormAlert>{formError}</FormAlert>
          </div>
        ) : null}

        <div className="auth-form-field--full" style={{ marginTop: '0.25rem' }}>
          <Button type="submit" className="auth-card__submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating profile…' : 'Create profile'}
          </Button>

          <p className="auth-card__switch">
            Already have an account? <Link href="/login">Sign in.</Link>
          </p>
        </div>
      </form>
    </section>
  );
}
