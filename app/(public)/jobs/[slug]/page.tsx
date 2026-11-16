'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Send,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/dashboard/empty-state';
import { JobApplyModal } from '@/components/jobs/job-apply-modal';
import { getJobById } from '@/lib/api/jobs.api';
import { formatDate } from '@/lib/utils/format';
import { useAuthStore } from '@/store/auth-store';
import type { Job } from '@/types/domain';

export default function JobDetailPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const jobId = (params?.slug as string) || '';

  const user = useAuthStore((state) => state.user);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  // Fetch real job data
  const { data, isLoading, isError } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJobById(jobId),
    enabled: Boolean(jobId),
  });

  const job: Job | undefined = data?.data;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-slate-200 rounded-lg" />
        <div className="h-28 bg-slate-100 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-72 bg-slate-100 rounded-2xl" />
          <div className="h-72 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <EmptyState
          icon={BriefcaseBusiness}
          title="Career Opportunity Not Found"
          description="The job listing you are looking for may have been closed or removed by the poster."
          action={
            <Button asChild size="sm">
              <Link href="/jobs">
                <ArrowLeft size={14} /> Back to Jobs Board
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Opportunity Board
      </Link>

      {/* Header section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="warning">{job.employmentType ?? 'Full-time'}</Badge>
          <span className="text-xs text-slate-400">
            Posted {formatDate(job.createdAt)}
          </span>
          {job.deadline && (
            <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
              <Clock size={12} /> Deadline: {formatDate(job.deadline)}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 m-0">
          {job.title}
        </h1>

        <p className="text-sm font-semibold text-slate-700 flex items-center gap-2 m-0">
          <Building2 size={15} className="text-slate-400 shrink-0" />
          <span>{job.company}</span>
          <span>•</span>
          <MapPin size={15} className="text-slate-400 shrink-0" />
          <span>{job.location || 'Remote'}</span>
          <span>•</span>
          <span className="text-emerald-700 font-bold">{job.salary || 'Negotiable'}</span>
        </p>
      </div>

      {applySuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{applySuccess}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <article className="md:col-span-2 space-y-6">
          <Card className="p-6 space-y-3 shadow-xs">
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-400 m-0">
              THE ROLE
            </h2>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </Card>

          {job.requirements && (
            <Card className="p-6 space-y-3 shadow-xs">
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-400 m-0">
                QUALIFICATIONS & SKILLS
              </h2>
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {job.requirements}
              </div>
            </Card>
          )}

          <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl flex items-start gap-3">
            <ShieldCheck size={20} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <strong>Campus Network Assurance:</strong> This opening is verified and posted by an accredited university community member. Applying through this platform attaches your verified academic enrollment or alumni identity directly.
            </div>
          </div>
        </article>

        <aside className="space-y-4">
          <Card className="p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 m-0">
              POSTED BY ALUMNI
            </h3>
            <div>
              <strong className="text-sm text-slate-900 block flex items-center gap-1.5">
                {job.postedBy?.name || 'Accredited Member'}
                {job.postedBy?.verified && <UserCheck size={14} className="text-blue-600" />}
              </strong>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                {job.postedBy?.currentCompany || job.company}
              </p>
              {job.postedBy?.department && (
                <p className="text-[11px] text-slate-400 m-0 mt-0.5">
                  {job.postedBy.department}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              {user ? (
                <Button
                  id="apply-job-btn"
                  onClick={() => setShowApplyModal(true)}
                  className="w-full text-xs font-semibold"
                >
                  <Send size={14} /> Apply for Position
                </Button>
              ) : (
                <Button asChild className="w-full text-xs font-semibold">
                  <Link href="/login">
                    Sign in to Apply <ArrowUpRight size={14} />
                  </Link>
                </Button>
              )}

              {job.applicationUrl && (
                <Button asChild variant="outline" className="w-full text-xs">
                  <a href={job.applicationUrl} target="_blank" rel="noreferrer">
                    External Link <ExternalLink size={13} />
                  </a>
                </Button>
              )}
            </div>
          </Card>
        </aside>
      </div>

      {/* Apply Modal */}
      <JobApplyModal
        job={job}
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onSuccess={(title) => {
          setApplySuccess(`Your application for "${title}" has been submitted! Track it under your dashboard.`);
          queryClient.invalidateQueries({ queryKey: ['job', jobId] });
        }}
      />
    </div>
  );
}
