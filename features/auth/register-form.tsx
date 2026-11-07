'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Eye, EyeOff, GraduationCap, Loader2, School } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { register as registerAccount } from '@/lib/api/auth.api';
import { registerSchema, type RegisterValues } from './auth.schemas';

export function RegisterForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      department: '',
      batch: '',
      universityId: '',
    },
  });

  const role = watch('role');

  const onSubmit = async (values: RegisterValues) => {
    setFormError(null);
    try {
      const res = await registerAccount({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        department: values.department,
        batch: values.batch || undefined,
        universityId: values.universityId || undefined,
        graduationYear: values.graduationYear ? Number(values.graduationYear) : undefined,
      });

      if (res.data?.user) {
        queryClient.setQueryData(['auth', 'me'], res.data.user);
        if (values.role === 'STUDENT') {
          router.replace('/student/dashboard');
        } else {
          router.replace('/alumni/dashboard');
        }
      } else {
        router.replace('/login');
      }
    } catch (err: any) {
      setFormError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-100">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your institutional account</h1>
        <p className="mt-2 text-sm text-slate-500">
          Join your university network as a student or graduate
        </p>
      </div>

      {/* Role Picker */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setValue('role', 'STUDENT')}
          className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition ${
            role === 'STUDENT'
              ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className={`rounded-lg p-2 ${role === 'STUDENT' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            <School className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Student</div>
            <div className="text-xs text-slate-500">Current enrolled</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setValue('role', 'ALUMNI')}
          className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition ${
            role === 'ALUMNI'
              ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className={`rounded-lg p-2 ${role === 'ALUMNI' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Alumnus</div>
            <div className="text-xs text-slate-500">Graduated</div>
          </div>
        </button>
      </div>

      {formError && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Jane Doe"
            {...register('name')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Institutional Email
          </label>
          <input
            type="email"
            placeholder="student@university.edu"
            {...register('email')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Department
            </label>
            <input
              type="text"
              placeholder="Computer Science"
              {...register('department')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            {errors.department && (
              <p className="mt-1 text-xs text-red-600">{errors.department.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              {role === 'STUDENT' ? 'Batch / Class' : 'Graduation Year'}
            </label>
            <input
              type="text"
              placeholder={role === 'STUDENT' ? '2024' : '2020'}
              {...register('batch')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Student / Institutional ID <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. STU-2024-001"
            {...register('universityId')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Password (min 12 characters, uppercase, symbol)
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              {...register('password')}
              className="w-full rounded-lg border border-slate-300 py-2 pl-3 pr-10 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              {...register('confirmPassword')}
              className="w-full rounded-lg border border-slate-300 py-2 pl-3 pr-10 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-3 flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering Account...
            </>
          ) : (
            'Complete Registration'
          )}
        </button>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
        Already registered?{' '}
        <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
          Sign In
        </Link>
      </div>
    </div>
  );
}
