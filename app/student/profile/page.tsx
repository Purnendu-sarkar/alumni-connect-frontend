'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { getMe, updateMe } from '@/lib/api/user.api';
import { useAuth } from '@/lib/hooks/use-auth';
import { CardSkeleton } from '@/components/shared/skeletons';

interface StudentProfileFormValues {
  bio: string;
  department: string;
  batch: string;
  studentId: string;
  skills: string;
  linkedinUrl: string;
  githubUrl: string;
}

export default function StudentProfilePage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: getMe,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<StudentProfileFormValues>();

  useEffect(() => {
    if (data?.data?.user) {
      const u = data.data.user;
      reset({
        bio: u.bio ?? '',
        department: u.department ?? '',
        batch: u.batch ?? '',
        studentId: u.studentId ?? '',
        skills: u.skills?.join(', ') ?? '',
        linkedinUrl: u.linkedinUrl ?? '',
        githubUrl: u.githubUrl ?? '',
      });
    }
  }, [data, reset]);

  const updateMutation = useMutation({
    mutationFn: (values: StudentProfileFormValues) => {
      const skillsArray = values.skills
        ? values.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      return updateMe({
        bio: values.bio,
        department: values.department,
        batch: values.batch,
        studentId: values.studentId,
        skills: skillsArray,
        linkedinUrl: values.linkedinUrl || null,
        githubUrl: values.githubUrl || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      setSuccessMessage('Profile saved successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const onSubmit = (values: StudentProfileFormValues) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return <CardSkeleton />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Student Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your academic background, technical skills, and public links for networking.
        </p>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          <span>{successMessage}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Email Address (Institutional)
            </label>
            <input
              type="text"
              disabled
              value={user?.email ?? ''}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Student ID
            </label>
            <input
              type="text"
              {...register('studentId')}
              placeholder="e.g. STU-2024-001"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Department
            </label>
            <input
              type="text"
              {...register('department')}
              placeholder="Computer Science"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Batch / Cohort
            </label>
            <input
              type="text"
              {...register('batch')}
              placeholder="2024"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Short Bio / Academic Objective
          </label>
          <textarea
            rows={3}
            {...register('bio')}
            placeholder="Tell alumni and peers about your academic interests and career aspirations..."
            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Skills (comma-separated)
          </label>
          <input
            type="text"
            {...register('skills')}
            placeholder="React, TypeScript, Python, Data Analysis, SQL"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              LinkedIn Profile URL
            </label>
            <input
              type="url"
              {...register('linkedinUrl')}
              placeholder="https://linkedin.com/in/..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              GitHub Profile URL
            </label>
            <input
              type="url"
              {...register('githubUrl')}
              placeholder="https://github.com/..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || updateMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting || updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

