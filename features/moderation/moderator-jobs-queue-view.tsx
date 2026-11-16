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
  Eye,
  Lock,
  MapPin,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Unlock,
  UserCheck,
  X,
  XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog';
import { EmptyState } from '@/components/dashboard/empty-state';
import { CardGridSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import {
  approveJob,
  claimJob,
  getModeratorJobsQueue,
  rejectJob,
  requestJobChanges,
  unclaimJob,
} from '@/lib/api/jobs.api';
import { formatDate } from '@/lib/utils/format';
import { useAuthStore } from '@/store/auth-store';
import type { Job, UserRole } from '@/types/domain';

interface ModeratorJobsQueueViewProps {
  currentRole: UserRole;
  basePath: string;
  filterMode?: string;
}

export function ModeratorJobsQueueView({
  currentRole,
  basePath,
  filterMode = 'SUBMITTED',
}: ModeratorJobsQueueViewProps) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentUser = useAuthStore((state) => state.user);

  const initialStatus =
    filterMode === 'IN_REVIEW'
      ? 'UNDER_REVIEW'
      : filterMode === 'ALL'
      ? 'SUBMITTED'
      : filterMode;

  const [activeStatus, setActiveStatus] = useState<string>(initialStatus);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Reject modal state
  const [rejectingJob, setRejectingJob] = useState<Job | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectReasonCode, setRejectReasonCode] = useState('POLICY_VIOLATION');
  const [rejectInternalNote, setRejectInternalNote] = useState('');

  // Request Changes modal state
  const [changesJob, setChangesJob] = useState<Job | null>(null);
  const [changesNotes, setChangesNotes] = useState('');
  const [changesInternalNote, setChangesInternalNote] = useState('');

  const queueQuery = useQuery({
    queryKey: ['moderator-jobs-queue', accessToken, activeStatus],
    queryFn: async () => {
      const res = await getModeratorJobsQueue(accessToken, { status: activeStatus });
      return res.data ?? [];
    },
    enabled: Boolean(accessToken),
  });

  const jobs: Job[] = queueQuery.data ?? [];

  // Claim mutation
  const claimMutation = useMutation({
    mutationFn: (jobId: string) => claimJob(accessToken, jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderator-jobs-queue'] });
      setActionNotice('Listing claimed successfully. You now hold the active review lock.');
      setTimeout(() => setActionNotice(null), 4000);
    },
    onError: (err: unknown) => {
      setActionNotice(err instanceof Error ? err.message : 'Job was already claimed by another moderator.');
    },
  });

  // Unclaim mutation
  const unclaimMutation = useMutation({
    mutationFn: (jobId: string) => unclaimJob(accessToken, jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderator-jobs-queue'] });
      setActionNotice('Review claim released back to the general queue.');
      setTimeout(() => setActionNotice(null), 4000);
    },
    onError: (err: unknown) => {
      setActionNotice(err instanceof Error ? err.message : 'Failed to release claim.');
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (jobId: string) => approveJob(accessToken, jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderator-jobs-queue'] });
      queryClient.invalidateQueries({ queryKey: ['published-jobs'] });
      setActionNotice('Job verified and published live to the campus opportunity board!');
      setTimeout(() => setActionNotice(null), 4000);
    },
    onError: (err: unknown) => {
      setActionNotice(err instanceof Error ? err.message : 'Failed to approve job.');
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({
      jobId,
      reason,
      reasonCode,
      internalNote,
    }: {
      jobId: string;
      reason: string;
      reasonCode: string;
      internalNote?: string;
    }) => rejectJob(accessToken, jobId, { reason, reasonCode, internalNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderator-jobs-queue'] });
      setActionNotice('Job listing rejected and feedback dispatched to the alumni poster.');
      setRejectingJob(null);
      setRejectReason('');
      setRejectInternalNote('');
      setTimeout(() => setActionNotice(null), 4000);
    },
    onError: (err: unknown) => {
      setActionNotice(err instanceof Error ? err.message : 'Failed to reject job.');
    },
  });

  // Request changes mutation
  const changesMutation = useMutation({
    mutationFn: ({
      jobId,
      notes,
      internalNote,
    }: {
      jobId: string;
      notes: string;
      internalNote?: string;
    }) => requestJobChanges(accessToken, jobId, { notes, internalNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderator-jobs-queue'] });
      setActionNotice('Requested revisions sent to the poster. Listing placed on hold.');
      setChangesJob(null);
      setChangesNotes('');
      setChangesInternalNote('');
      setTimeout(() => setActionNotice(null), 4000);
    },
    onError: (err: unknown) => {
      setActionNotice(err instanceof Error ? err.message : 'Failed to request changes.');
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="INSTITUTIONAL TRUST & QUALITY"
        title="Job Moderation Queue"
        description="Verify hiring legitimacy, employer authenticity, and student protections before publishing to the live board."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => queueQuery.refetch()}
              disabled={queueQuery.isFetching}
            >
              <RefreshCw size={13} className={queueQuery.isFetching ? 'animate-spin' : ''} /> Refresh Queue
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

      {/* Status Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { key: 'SUBMITTED', label: 'Unclaimed Submissions' },
          { key: 'UNDER_REVIEW', label: 'In Review' },
          { key: 'CHANGES_REQUESTED', label: 'Changes Requested' },
          { key: 'PUBLISHED', label: 'Published' },
          { key: 'REJECTED', label: 'Rejected' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveStatus(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              activeStatus === tab.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Queue Grid */}
      {queueQuery.isLoading ? (
        <CardGridSkeleton count={4} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title={`No jobs in "${activeStatus.replace('_', ' ')}"`}
          description="The institutional queue is currently clear for this status category."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.map((job) => {
            const isClaimedByMe = job.reviewer?.id === currentUser?.id;
            const isSuperAdmin = currentRole === 'SUPER_ADMIN';
            const canModerate = isClaimedByMe || isSuperAdmin;

            return (
              <Card key={job.id} className="p-5 flex flex-col justify-between space-y-4 shadow-xs hover:border-slate-300 transition-colors">
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={job.status || 'SUBMITTED'} />
                      <Badge variant="neutral">{job.employmentType || 'Full-time'}</Badge>
                    </div>

                    {job.reviewer ? (
                      <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Lock size={11} />
                        {isClaimedByMe ? 'Claimed by You' : `Reviewer: ${job.reviewer.name}`}
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Unlock size={11} /> Unclaimed
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 m-0">
                    <Link href={`${basePath}/jobs/${job.id}`} className="hover:text-blue-600 transition-colors">
                      {job.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-slate-600 m-0 mt-1 flex items-center gap-2">
                    <Building2 size={13} className="text-slate-400 shrink-0" />
                    <strong>{job.company}</strong>
                    <span>•</span>
                    <span>{job.location || 'Remote'}</span>
                  </p>

                  {/* Poster verification snippet */}
                  {job.postedBy && (
                    <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs flex items-center justify-between">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Submitted by Alumni</span>
                        <strong className="text-slate-900 flex items-center gap-1">
                          {job.postedBy.name}
                          {job.postedBy.verified && <UserCheck size={13} className="text-blue-600" />}
                        </strong>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {job.postedBy.department || 'Alumni Member'}
                      </span>
                    </div>
                  )}

                  {/* Risk Hints */}
                  {job.riskHints && job.riskHints.length > 0 && (
                    <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2">
                      <ShieldAlert size={15} className="text-rose-600 shrink-0 mt-0.5" />
                      <div className="text-[11px] text-rose-800">
                        <strong>Security Flags:</strong> {job.riskHints.join(' ')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <Button variant="ghost" size="sm" asChild className="text-xs h-8">
                    <Link href={`${basePath}/jobs/${job.id}`}>
                      <Eye size={13} /> Deep Inspect
                    </Link>
                  </Button>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Claim Button */}
                    {!job.reviewer && (
                      <Button
                        size="sm"
                        onClick={() => claimMutation.mutate(job.id)}
                        disabled={claimMutation.isPending}
                        className="text-xs h-8"
                      >
                        <Lock size={12} /> Claim Review
                      </Button>
                    )}

                    {/* Unclaim Button */}
                    {isClaimedByMe && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => unclaimMutation.mutate(job.id)}
                        disabled={unclaimMutation.isPending}
                        className="text-xs h-8 text-slate-600"
                      >
                        Release Claim
                      </Button>
                    )}

                    {/* Fast Moderation Actions if claimed or admin */}
                    {canModerate && activeStatus !== 'PUBLISHED' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setChangesJob(job)}
                          className="text-xs h-8 text-amber-700 border-amber-300 hover:bg-amber-50"
                        >
                          Changes
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setRejectingJob(job)}
                          className="text-xs h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                          Reject
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate(job.id)}
                          disabled={approveMutation.isPending}
                          className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        >
                          <Check size={13} /> Approve
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingJob && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 m-0 flex items-center gap-2">
                <XCircle size={18} className="text-rose-600" /> Reject Job Posting
              </h3>
              <button
                type="button"
                onClick={() => setRejectingJob(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 m-0">
              Rejecting <strong>{rejectingJob.title}</strong> by {rejectingJob.company}. The feedback below will be displayed to the alumni author.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rejection Classification *
                </label>
                <select
                  value={rejectReasonCode}
                  onChange={(e) => setRejectReasonCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                >
                  <option value="POLICY_VIOLATION">Institutional Policy Violation</option>
                  <option value="SCAM_OR_SUSPICIOUS">Suspicious or Unverified Company</option>
                  <option value="UNREALISTIC_COMPENSATION">Unrealistic or Misleading Compensation</option>
                  <option value="INAPPROPRIATE_CONTENT">Inappropriate or Commercial Spam</option>
                  <option value="EXTERNAL_CONTACT_VIOLATION">Prohibited Direct Contact Info</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Owner-Visible Rejection Reason *
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this listing violates campus guidelines and cannot be published…"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Internal Moderator Audit Note (Private to Staff)
                </label>
                <input
                  type="text"
                  value={rejectInternalNote}
                  onChange={(e) => setRejectInternalNote(e.target.value)}
                  placeholder="Optional internal log note…"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setRejectingJob(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                onClick={() =>
                  rejectMutation.mutate({
                    jobId: rejectingJob.id,
                    reason: rejectReason.trim(),
                    reasonCode: rejectReasonCode,
                    internalNote: rejectInternalNote.trim() || undefined,
                  })
                }
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Request Changes Modal */}
      {changesJob && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 m-0 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-600" /> Request Revisions from Author
              </h3>
              <button
                type="button"
                onClick={() => setChangesJob(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 m-0">
              The listing will transition to <strong>Changes Requested</strong>. The author will be notified to update and resubmit.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Required Changes & Feedback *
                </label>
                <textarea
                  rows={4}
                  value={changesNotes}
                  onChange={(e) => setChangesNotes(e.target.value)}
                  placeholder="e.g. Please clarify minimum qualifications and provide a verified corporate email address…"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Internal Moderator Note (Private)
                </label>
                <input
                  type="text"
                  value={changesInternalNote}
                  onChange={(e) => setChangesInternalNote(e.target.value)}
                  placeholder="Optional internal note…"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setChangesJob(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!changesNotes.trim() || changesMutation.isPending}
                onClick={() =>
                  changesMutation.mutate({
                    jobId: changesJob.id,
                    notes: changesNotes.trim(),
                    internalNote: changesInternalNote.trim() || undefined,
                  })
                }
              >
                Send Revision Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
