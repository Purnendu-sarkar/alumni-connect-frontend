'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BriefcaseBusiness, CheckCircle2, Send, X } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/dashboard/page-header';
import { createJob, type CreateJobInput } from '@/lib/api/jobs.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface JobCreateFormProps {
  currentRole: UserRole;
  basePath: string;
}

export function JobCreateForm({ currentRole, basePath }: JobCreateFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState(user?.department ? `${user.department} Tech Partner` : '');
  const [location, setLocation] = useState('Dhaka, Bangladesh · Hybrid');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: CreateJobInput) => createJob(accessToken, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['published-jobs'] });
      router.push(`${basePath}/jobs/my-jobs?created=true`);
    },
    onError: (err: unknown) => {
      setFormError(err instanceof Error ? err.message : 'Failed to submit job posting.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!title.trim() || !company.trim() || !description.trim()) {
      setFormError('Job title, company name, and detailed description are required.');
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      employmentType,
      applicationUrl: applicationUrl.trim() || undefined,
      description: description.trim(),
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        backHref={`${basePath}/jobs`}
        backLabel="Back to Jobs"
        eyebrow="RECRUIT CAMPUS TALENT"
        title="Post a Career Opportunity"
        description="Submit early-career jobs, internships, or referral openings to the institutional moderation queue."
      />

      {formError ? <FormAlert>{formError}</FormAlert> : null}

      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Job Position Title *"
              placeholder="e.g. Junior Backend Engineer (Go/Node.js)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Input
              label="Hiring Company or Organization *"
              placeholder="e.g. Brain Station 23 / Pathao"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Workplace Location & Model"
              placeholder="e.g. Dhaka · Hybrid / Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Employment Contract Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>

          <Input
            label="Direct Application URL or Careers Portal Link"
            placeholder="https://company.com/careers/apply-123"
            value={applicationUrl}
            onChange={(e) => setApplicationUrl(e.target.value)}
            hint="Applicants can apply through this URL or submit an internal campus profile."
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Role Description & Candidate Requirements *
            </label>
            <textarea
              rows={6}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail responsibilities, core skills (languages, frameworks, tools), batch preferences, and any internal referral perks for campus peers…"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" size="sm" asChild>
              <Link href={`${basePath}/jobs`}>Cancel</Link>
            </Button>
            <Button type="submit" size="sm" disabled={createMutation.isPending}>
              <Send size={14} /> {createMutation.isPending ? 'Submitting to Review Queue…' : 'Publish Opportunity'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
