'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { getMe, updateMe } from '@/lib/api/user.api';
import { useAuth } from '@/lib/hooks/use-auth';
import { CardSkeleton } from '@/components/shared/skeletons';

interface AlumniProfileFormValues {
  bio: string;
  department: string;
  batch: string;
  currentCompany: string;
  position: string;
  employmentStatus: string;
  skills: string;
  linkedinUrl: string;
  githubUrl: string;
}

export default function AlumniProfilePage() {
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
  } = useForm<AlumniProfileFormValues>();

  useEffect(() => {
    if (data?.data?.user) {
      const u = data.data.user;
      reset({
        bio: u.bio ?? '',
        department: u.department ?? '',
        batch: u.batch ?? '',
        currentCompany: u.currentCompany ?? '',
        position: u.position ?? '',
        employmentStatus: u.employmentStatus ?? 'Employed',
        skills: u.skills?.join(', ') ?? '',
        linkedinUrl: u.linkedinUrl ?? '',
        githubUrl: u.githubUrl ?? '',
      });
    }
  }, [data, reset]);

  const updateMutation = useMutation({
    mutationFn: (values: AlumniProfileFormValues) => {
      const skillsArray = values.skills
        ? values.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      return updateMe({
        bio: values.bio,
        department: values.department,
        batch: values.batch,
        currentCompany: values.currentCompany,
        position: values.position,
        employmentStatus: values.employmentStatus,
        skills: skillsArray,
        linkedinUrl: values.linkedinUrl || null,
        githubUrl: values.githubUrl || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      setSuccessMessage('Alumni profile updated successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const onSubmit = (values: AlumniProfileFormValues) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return <CardSkeleton />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Alumni Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Keep your current position, organization, and technical skills updated for students seeking mentorship.
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
              Email Address
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
              Current Company / Organization
            </label>
            <input
              type="text"
              {...register('currentCompany')}
              placeholder="e.g. Google, Stripe, Microsoft"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Job Title / Current Position
            </label>
            <input
              type="text"
              {...register('position')}
              placeholder="e.g. Senior Software Engineer"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Employment Status
            </label>
            <select
              {...register('employmentStatus')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none bg-white"
            >
              <option value="Employed">Employed</option>
              <option value="Self-Employed">Self-Employed / Founder</option>
              <option value="Freelancer">Freelance / Consultant</option>
              <option value="Postgraduate Student">Postgraduate Studies</option>
              <option value="Seeking Opportunities">Open to Opportunities</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Department
            </label>
            <input
              type="text"
              {...register('department')}
              placeholder="Computer Science"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Graduation Year / Class
            </label>
            <input
              type="text"
              {...register('batch')}
              placeholder="2020"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Bio & Mentorship Interests
          </label>
          <textarea
            rows={3}
            {...register('bio')}
            placeholder="Share your career journey and how you can help current university students..."
            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Industry Skills & Expertise (comma-separated)
          </label>
          <input
            type="text"
            {...register('skills')}
            placeholder="Product Management, Cloud Architecture, Distributed Systems, Mentoring"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || updateMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
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

