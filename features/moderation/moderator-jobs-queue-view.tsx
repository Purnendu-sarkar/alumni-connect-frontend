'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog';
import { EmptyState } from '@/components/dashboard/empty-state';
import { CardGridSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { getPendingJobs, reviewJob } from '@/lib/api/jobs.api';
import { useAuthStore } from '@/store/auth-store';
import type { Job, UserRole } from '@/types/domain';

interface ModeratorJobsQueueViewProps {
  currentRole: UserRole;
  basePath: string;
  filterMode?: 'PENDING' | 'IN_REVIEW' | 'ALL';
}

export function ModeratorJobsQueueView({ currentRole, basePath, filterMode = 'PENDING' }: ModeratorJobsQueueViewProps) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [rejectingJob, setRejectingJob] = useState<Job | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Real backend pending jobs query
  const pendingJobsQuery = useQuery({
    queryKey: ['pending-jobs', accessToken],
    queryFn: () => getPendingJobs(accessToken),
    enabled: Boolean(accessToken),
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      jobId,
      status,
      reason,
    }: {
      jobId: string;
      status: 'APPROVED' | 'REJECTED';
      reason?: string;
    }) => reviewJob(accessToken, jobId, status, reason),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['pending-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['published-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setRejectingJob(null);
      setRejectionReason('');
      setActionNotice(
        vars.status === 'APPROVED'
          ? 'Job approved and published to the campus board!'
          : 'Job posting rejected with feedback sent to the author.'
      );
      setTimeout(() => setActionNotice(null), 4000);
    },
    onError: (err: unknown) => {
      setActionNotice(err instanceof Error ? err.message : 'Failed to update job status.');
    },
  });

  const pendingJobs = pendingJobsQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="INSTITUTIONAL QUALITY & TRUST"
        title="Job Moderation Queue"
        description="Verify hiring legitimacy, company authenticity, and candidate protections before publishing to the student board."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => pendingJobsQuery.refetch()}
              disabled={pendingJobsQuery.isFetching}
            >
              <RefreshCw size={13} className={pendingJobsQuery.isFetching ? 'animate-spin' : ''} /> Refresh Queue
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href={`${basePath}/dashboard`}>Moderator Overview</Link>
            </Button>
          </div>
        }
      />

      {actionNotice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      ) : null}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Link
          href={`${basePath}/jobs/pending`}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterMode === 'PENDING' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Pending Review ({pendingJobs.length})
        </Link>
        <Link
          href={`${basePath}/jobs/in-review`}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterMode === 'IN_REVIEW' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          In-Review Tasks (0)
        </Link>
        <Link
          href={`${basePath}/jobs`}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterMode === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Postings
        </Link>
      </div>

      {/* Jobs Review Queue */}
      {pendingJobsQuery.isLoading ? (
        <CardGridSkeleton count={3} />
      ) : pendingJobs.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="All submitted jobs are reviewed"
          description="There are currently no pending career opportunities waiting in the institutional moderation queue."
        />
      ) : (
        <div className="space-y-4">
          {pendingJobs.map((job) => (
            <article
              key={job.id}
              className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-slate-900 m-0">{job.title}</h3>
                    <StatusBadge status="PENDING" label="Under Review" />
                  </div>
                  <p className="text-xs text-slate-600 m-0">
                    <strong>{job.company}</strong> · {job.location || 'Remote'} · {job.employmentType || 'Full-time'}
                  </p>
                  <p className="text-[11px] text-slate-400 m-0 mt-1">
                    Submitted by: <strong className="text-slate-700">{job.postedBy?.name || 'Alumnus'}</strong> ({job.postedBy?.currentCompany || 'Alumni Network'}) ·{' '}
                    {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={reviewMutation.isPending}
                    onClick={() => reviewMutation.mutate({ jobId: job.id, status: 'APPROVED' })}
                  >
                    <Check size={14} /> Approve Posting
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={reviewMutation.isPending}
                    onClick={() => {
                      setRejectingJob(job);
                      setRejectionReason('Does not meet campus verification criteria or missing job details.');
                    }}
                    className="text-rose-600 hover:bg-rose-50"
                  >
                    <X size={14} /> Reject
                  </Button>
                </div>
              </div>

              {/* Job Description Box */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-xs leading-relaxed text-slate-700 space-y-2">
                <strong className="block text-slate-900">Submitted Description:</strong>
                <p className="m-0 whitespace-pre-wrap">{job.description}</p>
                {job.applicationUrl ? (
                  <div className="pt-2">
                    <a
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                    >
                      Application Link: {job.applicationUrl} <ExternalLink size={12} />
                    </a>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingJob ? (
        <ConfirmDialog
          isOpen={Boolean(rejectingJob)}
          onClose={() => setRejectingJob(null)}
          onConfirm={() =>
            reviewMutation.mutate({
              jobId: rejectingJob.id,
              status: 'REJECTED',
              reason: rejectionReason,
            })
          }
          title={`Reject Job: ${rejectingJob.title}`}
          description={`Provide specific feedback for ${rejectingJob.postedBy?.name || 'the author'} explaining why this posting cannot be published to the campus board.`}
          confirmLabel="Confirm Rejection"
          variant="destructive"
          isLoading={reviewMutation.isPending}
        >
          <div className="mt-3">
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Broken application URL, duplicate listing, or unclear compensation criteria…"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </ConfirmDialog>
      ) : null}
    </div>
  );
}
