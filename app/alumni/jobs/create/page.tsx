'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Briefcase, CheckCircle2, Loader2, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { createJob, type CreateJobInput } from '@/lib/api/jobs.api';

export default function CreateJobPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateJobInput>({
    defaultValues: {
      title: '',
      company: '',
      description: '',
      location: '',
      employmentType: 'Full-time',
      applicationUrl: '',
      applicationEmail: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateJobInput) => createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      router.push('/alumni/dashboard');
    },
    onError: (err: any) => {
      setServerError(err.message || 'Failed to submit job posting.');
    },
  });

  const onSubmit = (data: CreateJobInput) => {
    setServerError(null);
    mutation.mutate(data);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/alumni/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Alumni Desk</span>
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Post an Opportunity
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Share job openings, internships, or graduate roles with current students and fellow alumni.
          All submissions are reviewed by university moderators before publication.
        </p>
      </div>

      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
          {serverError}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Job Title *
          </label>
          <input
            type="text"
            placeholder="e.g. Associate Software Engineer, Marketing Analyst"
            {...register('title', { required: 'Job title is required.' })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Company / Organization *
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Corp, Google, Local Startup"
              {...register('company', { required: 'Company name is required.' })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
            {errors.company && <p className="mt-1 text-xs text-red-600">{errors.company.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Location
            </label>
            <input
              type="text"
              placeholder="e.g. Remote, New York, NY, London, UK"
              {...register('location')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Employment Type
          </label>
          <select
            {...register('employmentType')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none bg-white"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
            <option value="Graduate Program">Graduate Program</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Role Description & Qualifications *
          </label>
          <textarea
            rows={5}
            placeholder="Describe the responsibilities, required qualifications, and any referral perks for students..."
            {...register('description', { required: 'Role description is required.' })}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              External Application URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://company.com/careers/role"
              {...register('applicationUrl')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Application Email (Optional)
            </label>
            <input
              type="email"
              placeholder="jobs@company.com"
              {...register('applicationEmail')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <Link
            href="/alumni/dashboard"
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
          >
            {isSubmitting || mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Submitting for Review...</span>
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4" />
                <span>Submit Job Posting</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

