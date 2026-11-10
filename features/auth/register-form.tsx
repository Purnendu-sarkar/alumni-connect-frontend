'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, CheckCircle2, Eye, EyeOff, GraduationCap, Mail, School } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
      <Card className="p-6 sm:p-8 space-y-6">
        <CardHeader className="p-0 space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 font-mono">
            REGISTRATION RECEIVED
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 m-0">
            <Mail size={24} className="text-emerald-600" /> Check your inbox.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 m-0">
            We sent a verification link to <strong>{registeredSuccess.email}</strong>.
          </p>
        </CardHeader>

        <CardContent className="p-0 space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 space-y-2">
            {isAlumni ? (
              <div>
                <p className="font-bold text-slate-900 m-0">Alumni Verification Step:</p>
                <ol className="list-decimal pl-4 mt-1 space-y-1 text-slate-600">
                  <li>Open the confirmation email and click <strong>Verify Email Address</strong>.</li>
                  <li>Your profile will then be reviewed by university administration to accredit your alumni standing.</li>
                  <li>You will receive an approval confirmation once accredited.</li>
                </ol>
              </div>
            ) : (
              <div>
                <p className="font-bold text-slate-900 m-0">Student Verification Step:</p>
                <p className="mt-1 text-slate-600 m-0">
                  Click the verification link in your email to confirm your university email and immediately activate your account for sign in.
                </p>
              </div>
            )}
          </div>

          {registeredSuccess.debugToken ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <strong>Development Quick Verification:</strong>
              <div>
                <Link
                  href={`/verify-email?token=${registeredSuccess.debugToken}&role=${registeredSuccess.role}`}
                  className="text-amber-800 underline font-semibold"
                >
                  Click here to verify email directly in dev mode
                </Link>
              </div>
            </div>
          ) : null}

          <Button asChild className="w-full justify-center">
            <Link href="/login">
              Proceed to Sign In <ArrowRight size={15} />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8 space-y-6">
      <CardHeader className="p-0 space-y-1.5">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-mono">
          OPEN YOUR DOOR
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight m-0">
          Be part of the campus record.
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 m-0">
          Select your status and enter your academic details to join your verified community.
        </p>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {/* Role Selection Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setValue('role', 'STUDENT')}
            className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all duration-150 cursor-pointer ${
              role === 'STUDENT'
                ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
            }`}
            aria-pressed={role === 'STUDENT'}
          >
            <div className={`p-2 rounded-xl shrink-0 ${role === 'STUDENT' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
              <School size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-slate-900">Current Student</span>
                {role === 'STUDENT' && <CheckCircle2 size={15} className="text-blue-600 shrink-0" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 m-0 truncate">Mentorship & jobs</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setValue('role', 'ALUMNI')}
            className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all duration-150 cursor-pointer ${
              role === 'ALUMNI'
                ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
            }`}
            aria-pressed={role === 'ALUMNI'}
          >
            <div className={`p-2 rounded-xl shrink-0 ${role === 'ALUMNI' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
              <GraduationCap size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-slate-900">Alumni / Graduate</span>
                {role === 'ALUMNI' && <CheckCircle2 size={15} className="text-blue-600 shrink-0" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 m-0 truncate">Post jobs & mentor</p>
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <Input
            label="Full Name"
            placeholder="e.g. Sabbir Ahmed"
            error={errors.name?.message}
            {...register('name')}
            required
          />

          <Input
            label="University Email Address"
            type="email"
            placeholder="e.g. sabbir.cse@demo.edu"
            hint="Your institutional or permanent personal address."
            error={errors.email?.message}
            {...register('email')}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Department"
              placeholder="e.g. Computer Science"
              error={errors.department?.message}
              {...register('department')}
              required
            />

            <Input
              label="Batch / Cohort"
              placeholder="e.g. Batch 2022"
              error={errors.batch?.message}
              {...register('batch')}
              required
            />
          </div>

          {role === 'STUDENT' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Student ID (Optional)"
                placeholder="e.g. 20221004"
                error={errors.studentId?.message}
                {...register('studentId')}
              />

              <Input
                label="Current Semester"
                placeholder="e.g. 6th Semester"
                error={errors.currentSemester?.message}
                {...register('currentSemester')}
              />

              <Input
                label="Admission Year"
                placeholder="e.g. 2022"
                error={errors.admissionYear?.message}
                {...register('admissionYear')}
              />

              <Input
                label="Expected Graduation"
                placeholder="e.g. 2026"
                error={errors.expectedGraduationYear?.message}
                {...register('expectedGraduationYear')}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Graduation Year"
                  placeholder="e.g. 2021"
                  error={errors.graduationYear?.message}
                  {...register('graduationYear')}
                />

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Employment Status
                  </label>
                  <select
                    {...register('employmentStatus')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Employed">Employed / Working</option>
                    <option value="Self-Employed">Self-Employed / Founder</option>
                    <option value="Higher Studies">Pursuing Higher Studies</option>
                    <option value="Open to Work">Open to Opportunities</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Current Employer / Organization"
                  placeholder="e.g. bKash, Google, Pathao"
                  error={errors.currentCompany?.message}
                  {...register('currentCompany')}
                />

                <Input
                  label="Position / Designation"
                  placeholder="e.g. Senior Software Engineer"
                  error={errors.position?.message}
                  {...register('position')}
                />
              </div>
            </div>
          )}

          <Input
            label="Key Skills"
            placeholder="e.g. React, Node.js, Python, System Design (comma-separated)"
            error={errors.skills?.message}
            {...register('skills')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
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
                className="absolute right-3 top-8.5 p-1 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
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
                className="absolute right-3 top-8.5 p-1 text-slate-400 hover:text-slate-600"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
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
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating profile…' : 'Create Verified Profile'}
          </Button>

          <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 m-0">
            Already registered?{' '}
            <Link href="/login" className="font-bold text-blue-600 hover:text-blue-800 transition-colors">
              Sign in to your account
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
