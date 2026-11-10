'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, CheckCircle2, Eye, EyeOff, GraduationCap, Mail, School } from 'lucide-react';
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
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState<{
    email: string;
    role: 'STUDENT' | 'ALUMNI';
    debugToken?: string;
  } | null>(null);

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

      setRegisteredSuccess({
        email: values.email,
        role: values.role as 'STUDENT' | 'ALUMNI',
        debugToken: response.data.debugToken,
      });
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    }
  };

  if (registeredSuccess) {
    const isAlumni = registeredSuccess.role === 'ALUMNI';
    return (
      <section className="auth-card">
        <p className="eyebrow" style={{ color: '#16a34a' }}>REGISTRATION RECEIVED</p>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Mail size={32} color="#16a34a" /> Check your inbox.
        </h1>
        <p className="lede">
          We sent a verification link to <strong>{registeredSuccess.email}</strong>.
        </p>

        <div
          style={{
            margin: '1.5rem 0',
            padding: '1.25rem',
            border: '2px solid var(--ink)',
            background: 'var(--surface)',
            fontSize: '0.9rem',
            lineHeight: 1.6,
          }}
        >
          {isAlumni ? (
            <div>
              <p style={{ margin: 0, fontWeight: 700 }}>Alumni Verification Step:</p>
              <ol style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
                <li>Open the confirmation email and click <strong>Verify Email Address</strong>.</li>
                <li>Your profile will then be reviewed by university administration to accredit your alumni standing.</li>
                <li>You will receive an approval confirmation once accredited.</li>
              </ol>
            </div>
          ) : (
            <div>
              <p style={{ margin: 0, fontWeight: 700 }}>Student Verification Step:</p>
              <p style={{ margin: '0.5rem 0 0' }}>
                Click the verification link in your email to confirm your student email and immediately activate your account for sign in.
              </p>
            </div>
          )}
        </div>

        {registeredSuccess.debugToken ? (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '4px',
              fontSize: '0.8rem',
              marginBottom: '1.5rem',
            }}
          >
            <strong>Development Helper:</strong>
            <div style={{ marginTop: '0.25rem' }}>
              <Link
                href={`/verify-email?token=${registeredSuccess.debugToken}&role=${registeredSuccess.role}`}
                style={{ color: '#b45309', textDecoration: 'underline' }}
              >
                Click here to verify email directly in dev mode
              </Link>
            </div>
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Button asChild style={{ width: '100%' }}>
            <Link href="/login">
              Proceed to Sign in <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </section>
    );
  }

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
            <span className="auth-role-btn__title">Alumni / Graduate</span>
            <span className="auth-role-btn__desc">Post opportunities & mentor</span>
          </div>
          <div className="auth-role-btn__check">
            <CheckCircle2 size={18} />
          </div>
        </button>
      </div>

      <form onSubmit={handleSubmit(submit)} className="auth-form-grid" noValidate>
        <div className="auth-form-field--full">
          <Input
            label="Full Name"
            placeholder="e.g. Tanzim Sakib"
            error={errors.name?.message}
            {...register('name')}
            required
          />
        </div>

        <div className="auth-form-field--full">
          <Input
            label="University Email Address"
            type="email"
            placeholder="e.g. sakib.cse@demo.edu"
            hint="Your institutional or permanent personal address."
            error={errors.email?.message}
            {...register('email')}
            required
          />
        </div>

        <div>
          <Input
            label="Department"
            placeholder="e.g. Computer Science"
            error={errors.department?.message}
            {...register('department')}
            required
          />
        </div>

        <div>
          <Input
            label="Batch / Cohort"
            placeholder="e.g. Batch 2018 or 18th"
            error={errors.batch?.message}
            {...register('batch')}
            required
          />
        </div>

        {role === 'STUDENT' ? (
          <>
            <div>
              <Input
                label="Student ID (Optional)"
                placeholder="e.g. 180104001"
                error={errors.studentId?.message}
                {...register('studentId')}
              />
            </div>

            <div>
              <Input
                label="Current Semester"
                placeholder="e.g. 7th Semester"
                error={errors.currentSemester?.message}
                {...register('currentSemester')}
              />
            </div>

            <div>
              <Input
                label="Admission Year"
                placeholder="e.g. 2021"
                error={errors.admissionYear?.message}
                {...register('admissionYear')}
              />
            </div>

            <div>
              <Input
                label="Expected Graduation Year"
                placeholder="e.g. 2025"
                error={errors.expectedGraduationYear?.message}
                {...register('expectedGraduationYear')}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <Input
                label="Graduation Year"
                placeholder="e.g. 2022"
                error={errors.graduationYear?.message}
                {...register('graduationYear')}
              />
            </div>

            <div>
              <label className="input-group__label">Current Employment Status</label>
              <select
                className="input-control"
                {...register('employmentStatus')}
                style={{ width: '100%', height: '44px', background: 'var(--paper, #fff)' }}
              >
                <option value="Employed">Employed / Working</option>
                <option value="Self-Employed">Self-Employed / Founder</option>
                <option value="Higher Studies">Pursuing Higher Studies</option>
                <option value="Open to Work">Open to Opportunities</option>
              </select>
            </div>

            <div>
              <Input
                label="Current Company / Organization"
                placeholder="e.g. Google, bKash, BRAC"
                error={errors.currentCompany?.message}
                {...register('currentCompany')}
              />
            </div>

            <div>
              <Input
                label="Job Title / Role"
                placeholder="e.g. Senior Software Engineer"
                error={errors.position?.message}
                {...register('position')}
              />
            </div>
          </>
        )}

        <div className="auth-form-field--full">
          <Input
            label="Key Skills"
            placeholder="e.g. React, Node.js, Python, Product Strategy (comma-separated)"
            error={errors.skills?.message}
            {...register('skills')}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
            error={errors.password?.message}
            {...register('password')}
            required
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
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '38px',
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
