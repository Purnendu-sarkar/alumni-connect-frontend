'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  GraduationCap,
  Lock,
  Mail,
  School,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { register as registerAccount, type RegisterInput } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth-store';
import { getAuthErrorMessage } from './auth-error';
import { registerSchema, type RegisterValues } from './auth.schemas';

export function RegisterForm() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formError, setFormError] = useState<string | null>(null);
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
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'STUDENT',
      universitySlug: process.env.NEXT_PUBLIC_UNIVERSITY_SLUG || undefined,
      employmentStatus: 'Employed',
    },
  });

  const role = watch('role');
  const watchedPassword = watch('password') || '';
  const watchedConfirmPassword = watch('confirmPassword') || '';

  // Real-time password requirement indicators matching backend passwordSchema
  const hasMinLength = watchedPassword.length >= 12;
  const hasLower = /[a-z]/.test(watchedPassword);
  const hasUpper = /[A-Z]/.test(watchedPassword);
  const hasNumber = /\d/.test(watchedPassword);
  const hasSymbol = /[^A-Za-z0-9]/.test(watchedPassword);
  const passwordsMatch = watchedPassword === watchedConfirmPassword && watchedConfirmPassword.length > 0;

  const handleNext = async () => {
    setFormError(null);
    if (step === 1) {
      const isValid = await trigger(['name', 'email', 'department', 'batch']);
      if (isValid) setStep(2);
    } else if (step === 2) {
      const fieldsToValidate: Array<keyof RegisterValues> =
        role === 'STUDENT' ? ['studentId'] : ['academicId', 'graduationYear'];
      const isValid = await trigger(fieldsToValidate);
      if (isValid) setStep(3);
    }
  };

  const handlePrev = () => {
    setFormError(null);
    setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : prev));
  };

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
      <div className="relative w-full max-w-xl">
        <div className="absolute inset-1 sm:inset-3 rounded-[38px] bg-gradient-to-b from-blue-500/15 via-indigo-400/10 to-sky-400/20 blur-2xl -z-10 pointer-events-none translate-y-3" />
        <div className="w-full bg-white rounded-[32px] sm:rounded-[36px] border border-white/90 shadow-[0_24px_50px_-12px_rgba(15,23,42,0.12),0_10px_24px_-6px_rgba(37,99,235,0.08),0_0_1px_1px_rgba(255,255,255,1)] p-8 sm:p-11 space-y-6 relative z-10">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 font-sans">
              REGISTRATION RECEIVED
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5 m-0 pt-0.5">
              <Mail size={28} className="text-emerald-600 shrink-0" /> Check your inbox.
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 m-0 pt-1">
              We sent a verification link to <strong className="text-slate-800">{registeredSuccess.email}</strong>.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 space-y-2">
              {isAlumni ? (
                <div>
                  <p className="font-bold text-slate-900 m-0">Alumni Verification Step:</p>
                  <ol className="list-decimal pl-4 mt-1.5 space-y-1 text-slate-600">
                    <li>Open the confirmation email and click <strong>Verify Email Address</strong>.</li>
                    <li>Your profile will then be reviewed by university administration to accredit your alumni standing.</li>
                    <li>You will receive an approval confirmation once accredited.</li>
                  </ol>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-slate-900 m-0">Student Verification Step:</p>
                  <p className="mt-1 text-slate-600 m-0 leading-relaxed">
                    Click the verification link in your email to confirm your university email and immediately activate your account for sign in.
                  </p>
                </div>
              )}
            </div>

            {registeredSuccess.debugToken ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-900">
                <span className="font-bold block">Development Sandbox Bypass:</span>
                <p className="text-[11px] text-amber-700 m-0">In non-production environments, activate immediately via:</p>
                <div className="pt-1">
                  <Link
                    href={`/verify-email?token=${registeredSuccess.debugToken}`}
                    className="inline-flex items-center gap-1 font-semibold text-blue-700 underline text-xs"
                  >
                    <span>Instant Email Verification Link</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ) : null}

            <Button asChild className="w-full h-12 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 justify-center">
              <Link href="/login" className="flex items-center gap-2">
                <span>Proceed to Sign In</span>
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-xl">
      {/* Ambient soft shadow glow behind credential card */}
      <div className="absolute inset-1 sm:inset-3 rounded-[38px] bg-gradient-to-b from-blue-500/15 via-indigo-400/10 to-sky-400/20 blur-2xl -z-10 pointer-events-none translate-y-3" />

      <div className="w-full bg-white rounded-[32px] sm:rounded-[36px] border border-white/90 shadow-[0_24px_50px_-12px_rgba(15,23,42,0.12),0_10px_24px_-6px_rgba(37,99,235,0.08),0_0_1px_1px_rgba(255,255,255,1)] p-6 sm:p-10 space-y-5 relative z-10 transition-all">
        {/* 3-Step Wizard Progress Stepper */}
        <div className="space-y-2.5 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-black">
                {step}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {step === 1 && 'Step 1: Role & Identity'}
                {step === 2 && (role === 'STUDENT' ? 'Step 2: Enrollment & Skills' : 'Step 2: Alumni Record & Skills')}
                {step === 3 && 'Step 3: Security & Credentials'}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-400 font-mono">
              {step}/3
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-3 gap-2">
            <div className="h-1.5 rounded-full bg-blue-600 transition-all duration-300" />
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-100'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-100'}`} />
          </div>
        </div>

        {/* Dynamic Step Header */}
        <div className="space-y-0.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight m-0">
            {step === 1 && 'Join the Campus Network'}
            {step === 2 && (role === 'STUDENT' ? 'Student Enrollment Record' : 'Alumni Professional Record')}
            {step === 3 && 'Set Account Password'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 m-0 pt-0.5">
            {step === 1 && 'Select your community standing and enter your institutional name and email.'}
            {step === 2 && (role === 'STUDENT' ? 'Enter your student ID and academic session info.' : 'Enter your graduation details and current career status.')}
            {step === 3 && 'Create a strong password to safeguard your academic credentials.'}
          </p>
        </div>

        {/* Multi-Step Wizard Form */}
        <form
          onSubmit={handleSubmit(submit, (fieldErrors) => {
            if (fieldErrors.name || fieldErrors.email || fieldErrors.department || fieldErrors.batch) {
              setStep(1);
            } else if (fieldErrors.studentId || fieldErrors.academicId || fieldErrors.graduationYear) {
              setStep(2);
            }
          })}
          className="space-y-4"
          noValidate
        >
          {/* ================= STEP 1: ROLE & BASIC IDENTITY ================= */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Role Selection Segmented Radio Cards */}
              <div
                role="radiogroup"
                aria-label="Select campus role"
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={role === 'STUDENT'}
                  onClick={() => setValue('role', 'STUDENT')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all duration-150 cursor-pointer ${
                    role === 'STUDENT'
                      ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 transition-colors ${
                      role === 'STUDENT' ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <School size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">Current Student</span>
                      {role === 'STUDENT' && <CheckCircle2 size={16} className="text-blue-600 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 m-0 truncate">Mentorship & jobs</p>
                  </div>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={role === 'ALUMNI'}
                  onClick={() => setValue('role', 'ALUMNI')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all duration-150 cursor-pointer ${
                    role === 'ALUMNI'
                      ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 transition-colors ${
                      role === 'ALUMNI' ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <GraduationCap size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">Alumni / Graduate</span>
                      {role === 'ALUMNI' && <CheckCircle2 size={16} className="text-blue-600 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 m-0 truncate">Post jobs & mentor</p>
                  </div>
                </button>
              </div>

              <Input
                label="Full Name *"
                placeholder="e.g. Sabbir Ahmed"
                leftIcon={<User size={18} />}
                error={errors.name?.message}
                {...register('name')}
                required
              />

              <Input
                label="University Email Address *"
                type="email"
                placeholder="e.g. sabbir.cse@demo.edu"
                leftIcon={<Mail size={18} />}
                hint="Your institutional or primary contact address."
                error={errors.email?.message}
                {...register('email')}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="Department *"
                  placeholder="e.g. Computer Science"
                  leftIcon={<Building2 size={18} />}
                  error={errors.department?.message}
                  {...register('department')}
                  required
                />

                <Input
                  label="Batch / Cohort *"
                  placeholder="e.g. Batch 2022"
                  leftIcon={<Calendar size={18} />}
                  error={errors.batch?.message}
                  {...register('batch')}
                  required
                />
              </div>

              <Button
                type="button"
                onClick={handleNext}
                className="w-full h-12 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] mt-2"
              >
                <span>Continue: Academic Record</span>
                <ArrowRight size={16} />
              </Button>
            </div>
          )}

          {/* ================= STEP 2: CAMPUS RECORD & SKILLS ================= */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {role === 'STUDENT' ? (
                <div className="space-y-3.5">
                  <Input
                    label="University Student ID *"
                    placeholder="e.g. 20221004"
                    leftIcon={<BookOpen size={18} />}
                    error={errors.studentId?.message}
                    {...register('studentId')}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                  </div>

                  <Input
                    label="Expected Graduation Year"
                    placeholder="e.g. 2026"
                    error={errors.expectedGraduationYear?.message}
                    {...register('expectedGraduationYear')}
                  />
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Input
                      label="Academic / Student ID *"
                      placeholder="e.g. 180104"
                      leftIcon={<BookOpen size={18} />}
                      error={errors.academicId?.message}
                      {...register('academicId')}
                      required
                    />

                    <Input
                      label="Degree / Major"
                      placeholder="e.g. B.Sc. in Computer Science"
                      leftIcon={<Award size={18} />}
                      error={errors.degree?.message}
                      {...register('degree')}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Input
                      label="Graduation Year *"
                      placeholder="e.g. 2021"
                      leftIcon={<Calendar size={18} />}
                      error={errors.graduationYear?.message}
                      {...register('graduationYear')}
                      required
                    />

                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-xs font-semibold text-slate-800 select-none">
                        Employment Status
                      </label>
                      <select
                        {...register('employmentStatus')}
                        className="w-full h-12 px-4 text-sm font-medium rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-2xs cursor-pointer"
                      >
                        <option value="Employed">Employed / Working</option>
                        <option value="Self-Employed">Self-Employed / Founder</option>
                        <option value="Higher Studies">Pursuing Higher Studies</option>
                        <option value="Open to Work">Open to Opportunities</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Input
                      label="Current Employer"
                      placeholder="e.g. Google, bKash, Pathao"
                      leftIcon={<Briefcase size={18} />}
                      error={errors.currentCompany?.message}
                      {...register('currentCompany')}
                    />

                    <Input
                      label="Designation / Role"
                      placeholder="e.g. Senior Software Engineer"
                      error={errors.position?.message}
                      {...register('position')}
                    />
                  </div>
                </div>
              )}

              <Input
                label="Key Skills & Competencies"
                placeholder="e.g. React, Node.js, Python, System Design (comma-separated)"
                leftIcon={<Sparkles size={18} />}
                error={errors.skills?.message}
                {...register('skills')}
              />

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrev}
                  className="h-12 px-5 rounded-xl text-sm font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </Button>

                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 h-12 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                >
                  <span>Continue: Security</span>
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: ACCOUNT CREDENTIALS & SECURITY ================= */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <PasswordInput
                  label="Password *"
                  placeholder="••••••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                  required
                />

                <PasswordInput
                  label="Confirm Password *"
                  placeholder="••••••••••••"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                  required
                />
              </div>

              {/* Real-time Password Security Checklist */}
              {watchedPassword.length > 0 && (
                <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs space-y-1.5 animate-in fade-in">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 m-0 mb-1">
                    Password Security Requirements
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                    <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>
                      {hasMinLength ? <Check size={13} className="shrink-0" /> : <X size={13} className="shrink-0" />}
                      <span>Minimum 12 characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>
                      {hasUpper ? <Check size={13} className="shrink-0" /> : <X size={13} className="shrink-0" />}
                      <span>Uppercase letter (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>
                      {hasLower ? <Check size={13} className="shrink-0" /> : <X size={13} className="shrink-0" />}
                      <span>Lowercase letter (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>
                      {hasNumber ? <Check size={13} className="shrink-0" /> : <X size={13} className="shrink-0" />}
                      <span>Numeric digit (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasSymbol ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>
                      {hasSymbol ? <Check size={13} className="shrink-0" /> : <X size={13} className="shrink-0" />}
                      <span>Special symbol (!@#$%^&*)</span>
                    </div>
                    {watchedConfirmPassword.length > 0 ? (
                      <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-600 font-semibold' : 'text-rose-500'}`}>
                        {passwordsMatch ? <Check size={13} className="shrink-0" /> : <X size={13} className="shrink-0" />}
                        <span>Passwords match</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Security Privacy Notice */}
              <div className="flex items-center gap-2 p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-900">
                <ShieldCheck size={16} className="text-blue-600 shrink-0" />
                <span className="text-[11px] leading-tight text-blue-800">
                  Credentials are protected by Argon2id cryptographic encryption and single-campus verified isolation.
                </span>
              </div>

              {formError ? (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrev}
                  className="h-12 px-5 rounded-xl text-sm font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                >
                  <Lock size={16} />
                  <span>{isSubmitting ? 'Creating profile…' : 'Create Verified Profile'}</span>
                </Button>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 m-0">
            Already registered?{' '}
            <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Sign in to your account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
