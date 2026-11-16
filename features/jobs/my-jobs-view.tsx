'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Edit,
  ExternalLink,
  Eye,
  Plus,
  RefreshCw,
  Trash2,
  Undo2,
  Users,
  X,
  XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog';
import { EmptyState } from '@/components/dashboard/empty-state';
import { TableSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import {
  closeJob,
  duplicateJob,
  getMyPostedJobs,
  submitJob,
  withdrawJob,
} from '@/lib/api/jobs.api';
import { formatDate } from '@/lib/utils/format';
import { useAuthStore } from '@/store/auth-store';
import type { Job, UserRole } from '@/types/domain';

interface MyJobsViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function MyJobsView({ currentRole, basePath }: MyJobsViewProps) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [closingJob, setClosingJob] = useState<Job | null>(null);
  const [closeReason, setCloseReason] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const jobsQuery = useQuery({
    queryKey: ['my-posted-jobs', accessToken],
    queryFn: async () => {
      const res = await getMyPostedJobs(accessToken);
      return res.data ?? [];
    },
    enabled: Boolean(accessToken),
  });

  const jobs: Job[] = jobsQuery.data ?? [];

  // Submit Draft Mutation
  const submitMutation = useMutation({
    mutationFn: (jobId: string) => submitJob(accessToken, jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-posted-jobs'] });
      setActionNotice('Job submitted to campus moderation queue.');
      setTimeout(() => setActionNotice(null), 4000);
    },
    onError: (err: unknown) => {
      setActionNotice(err instanceof Error ? err.message : 'Failed to submit job.');
    },
  });

  // Withdraw Mutation
  const withdrawMutation = useMutation({
    mutationFn: (jobId: string) => withdrawJob(accessToken, jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-posted-jobs'] });
      setActionNotice('Listing withdrawn from moderation queue.');
      setTimeout(() => setActionNotice(null), 4000);
    },
    onError: (err: unknown) => {
      setActionNotice(err instanceof Error ? err.message : 'Failed to withdraw job.');
    },
  });

  // Duplicate Mutation
  const duplicateMutation = useMutation({
    mutationFn: (jobId: string) => duplicateJob(accessToken, jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-posted-jobs'] });
      setActionNotice('Listing duplicated as a new draft.');
      setTimeout(() => setActionNotice(null), 4000);
    },
    onError: (err: unknown) => {
      setActionNotice(err instanceof Error ? err.message : 'Failed to duplicate job.');
    },
  });

  // Close Listing Mutation
  const closeMutation = useMutation({
    mutationFn: ({ jobId, reason }: { jobId: string; reason?: string }) =>
      closeJob(accessToken, jobId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-posted-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['published-jobs'] });
      setActionNotice('Job listing was closed.');
      setClosingJob(null);
      setCloseReason('');
      setTimeout(() => setActionNotice(null), 4000);
    },
    onError: (err: unknown) => {
      setActionNotice(err instanceof Error ? err.message : 'Failed to close job.');
    },
  });

  const filteredJobs = jobs.filter((j) => {
    if (activeTab === 'PUBLISHED') return j.status === 'PUBLISHED';
    if (activeTab === 'UNDER_REVIEW') return j.status === 'UNDER_REVIEW' || j.status === 'SUBMITTED';
    if (activeTab === 'CHANGES_REQUESTED') return j.status === 'CHANGES_REQUESTED';
    if (activeTab === 'DRAFT') return j.status === 'DRAFT';
    if (activeTab === 'CLOSED') return j.status === 'CLOSED';
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="RECRUITMENT DESK"
        title="My Posted Opportunities"
        description="Track review status, monitor campus applicants, and maintain your published career listings."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => jobsQuery.refetch()}
              disabled={jobsQuery.isFetching}
            >
              <RefreshCw size={13} className={jobsQuery.isFetching ? 'animate-spin' : ''} /> Refresh
            </Button>
            <Button asChild size="sm">
              <Link href={`${basePath}/jobs/create`}>
                <Plus size={14} /> Post Opportunity
              </Link>
            </Button>
          </div>
        }
      />

      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { key: 'ALL', label: `All (${jobs.length})` },
          {
            key: 'PUBLISHED',
            label: `Live (${jobs.filter((j) => j.status === 'PUBLISHED').length})`,
          },
          {
            key: 'UNDER_REVIEW',
            label: `In Review (${jobs.filter((j) => j.status === 'SUBMITTED' || j.status === 'UNDER_REVIEW').length})`,
          },
          {
            key: 'CHANGES_REQUESTED',
            label: `Changes Requested (${jobs.filter((j) => j.status === 'CHANGES_REQUESTED').length})`,
          },
          {
            key: 'DRAFT',
            label: `Drafts (${jobs.filter((j) => j.status === 'DRAFT').length})`,
          },
          {
            key: 'CLOSED',
            label: `Closed (${jobs.filter((j) => j.status === 'CLOSED').length})`,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      {jobsQuery.isLoading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="No career opportunities posted"
          description="Help students and fellow alumni jumpstart their careers by sharing openings from your organization."
          action={
            <Button size="sm" asChild>
              <Link href={`${basePath}/jobs/create`}>
                <Plus size={14} /> Post Your First Job
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const isLive = job.status === 'PUBLISHED';
            const isReview = job.status === 'SUBMITTED' || job.status === 'UNDER_REVIEW';
            const isChangesRequested = job.status === 'CHANGES_REQUESTED';
            const isDraft = job.status === 'DRAFT';
            const applicantCount = job.applicantCount ?? 0;

            return (
              <Card key={job.id} className="p-5 space-y-4 shadow-xs">
                {/* Moderation Feedback Banner */}
                {isChangesRequested && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-amber-900 m-0">Moderator Feedback:</h4>
                        <p className="text-xs text-amber-800 mt-1 m-0">
                          {job.latestFeedback || 'Please update job requirements and resubmit.'}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" asChild className="shrink-0 text-xs">
                      <Link href={`${basePath}/jobs/${job.id}/edit`}>Edit & Resubmit</Link>
                    </Button>
                  </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                      <h3 className="text-base font-bold text-slate-900 m-0">{job.title}</h3>
                      <StatusBadge status={job.status || 'DRAFT'} />
                    </div>

                    <p className="text-xs text-slate-500 m-0 flex items-center gap-2 flex-wrap">
                      <strong>{job.company}</strong>
                      <span>•</span>
                      <span>{job.location || 'Remote'}</span>
                      <span>•</span>
                      <span>{job.employmentType || 'Full-time'}</span>
                      <span>•</span>
                      <span>Created {formatDate(job.createdAt)}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    {/* View Applicants Button with Count */}
                    <Button size="sm" variant="outline" asChild className="text-xs h-8">
                      <Link href={`${basePath}/applications/received?jobId=${job.id}`}>
                        <Users size={13} /> Applicants ({applicantCount})
                      </Link>
                    </Button>

                    {/* Edit Button */}
                    <Button size="sm" variant="secondary" asChild className="text-xs h-8">
                      <Link href={`${basePath}/jobs/${job.id}/edit`}>
                        <Edit size={13} /> Edit
                      </Link>
                    </Button>

                    {/* Duplicate Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => duplicateMutation.mutate(job.id)}
                      disabled={duplicateMutation.isPending}
                      className="text-xs h-8"
                      title="Duplicate as new draft"
                    >
                      <Copy size={13} />
                    </Button>

                    {/* Submit Draft Button */}
                    {isDraft && (
                      <Button
                        size="sm"
                        onClick={() => submitMutation.mutate(job.id)}
                        disabled={submitMutation.isPending}
                        className="text-xs h-8"
                      >
                        Submit Review
                      </Button>
                    )}

                    {/* Withdraw from review */}
                    {isReview && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => withdrawMutation.mutate(job.id)}
                        disabled={withdrawMutation.isPending}
                        className="text-xs h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      >
                        <Undo2 size={13} /> Withdraw
                      </Button>
                    )}

                    {/* Close Job */}
                    {isLive && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setClosingJob(job)}
                        className="text-xs h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      >
                        <XCircle size={13} /> Close
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Accessible Close Job Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(closingJob)}
        title="Close Career Opportunity?"
        description={`Closing "${closingJob?.title}" will immediately remove it from the public jobs board and halt new candidate submissions.`}
        confirmLabel="Confirm & Close Listing"
        variant="destructive"
        isLoading={closeMutation.isPending}
        onConfirm={() => {
          if (closingJob) {
            closeMutation.mutate({ jobId: closingJob.id, reason: closeReason || 'Position filled' });
          }
        }}
        onClose={() => {
          setClosingJob(null);
          setCloseReason('');
        }}
      />
    </div>
  );
}
