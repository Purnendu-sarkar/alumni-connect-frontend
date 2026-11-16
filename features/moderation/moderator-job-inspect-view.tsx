'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  History,
  Lock,
  Mail,
  MapPin,
  Phone,
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
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import {
  adminOverrideJob,
  approveJob,
  claimJob,
  getModeratorJobDetail,
  rejectJob,
  requestJobChanges,
  unclaimJob,
} from '@/lib/api/jobs.api';
import { formatDate } from '@/lib/utils/format';
import { useAuthStore } from '@/store/auth-store';
import type { Job, UserRole } from '@/types/domain';

interface ModeratorJobInspectViewProps {
  id: string;
  currentRole: UserRole;
  basePath: string;
}

export function ModeratorJobInspectView({ id, currentRole, basePath }: ModeratorJobInspectViewProps) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentUser = useAuthStore((state) => state.user);

  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Reject modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectReasonCode, setRejectReasonCode] = useState('POLICY_VIOLATION');
  const [rejectInternalNote, setRejectInternalNote] = useState('');

  // Request Changes modal state
  const [isChangesModalOpen, setIsChangesModalOpen] = useState(false);
  const [changesNotes, setChangesNotes] = useState('');
  const [changesInternalNote, setChangesInternalNote] = useState('');

  const jobQuery = useQuery({
    queryKey: ['moderator-job-detail', accessToken, id],
    queryFn: async () => {
      const res = await getModeratorJobDetail(accessToken, id);
      return res.data;
    },
    enabled: Boolean(accessToken && id),
  });

  const job = jobQuery.data;

  // Claim mutation
  const claimMutation = useMutation({
    mutationFn: () => claimJob(accessToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderator-job-detail', accessToken, id] });
      queryClient.invalidateQueries({ queryKey: ['moderator-jobs-queue'] });
      setActionNotice('Review claim established. You now hold the active review lock.');
      setTimeout(() => setActionNotice(null), 4000);
    },
    onError: (err: unknown) => {
      setActionNotice(err instanceof Error ? err.message : 'Job was already claimed.');
    },
  });

  // Unclaim mutation
  const unclaimMutation = useMutation({
    mutationFn: () => unclaimJob(accessToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderator-job-detail', accessToken, id] });
      queryClient.invalidateQueries({ queryKey: ['moderator-jobs-queue'] });
      setActionNotice('Review claim released back to the institutional queue.');
      setTimeout(() => setActionNotice(null), 4000);
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: () => approveJob(accessToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderator-job-detail', accessToken, id] });
      queryClient.invalidateQueries({ queryKey: ['moderator-jobs-queue'] });
      queryClient.invalidateQueries({ queryKey: ['published-jobs'] });
      setActionNotice('Job verified and published live to the campus board!');
      setTimeout(() => setActionNotice(null), 4000);
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: () =>
      rejectJob(accessToken, id, {
        reason: rejectReason.trim(),
        reasonCode: rejectReasonCode,
        internalNote: rejectInternalNote.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderator-job-detail', accessToken, id] });
      queryClient.invalidateQueries({ queryKey: ['moderator-jobs-queue'] });
      setActionNotice('Listing rejected and feedback sent to author.');
      setIsRejectModalOpen(false);
      setRejectReason('');
      setRejectInternalNote('');
      setTimeout(() => setActionNotice(null), 4000);
    },
  });

  // Request changes mutation
  const changesMutation = useMutation({
    mutationFn: () =>
      requestJobChanges(accessToken, id, {
        notes: changesNotes.trim(),
        internalNote: changesInternalNote.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderator-job-detail', accessToken, id] });
      queryClient.invalidateQueries({ queryKey: ['moderator-jobs-queue'] });
      setActionNotice('Revision instructions sent to the author.');
      setIsChangesModalOpen(false);
      setChangesNotes('');
      setChangesInternalNote('');
      setTimeout(() => setActionNotice(null), 4000);
    },
  });

  if (jobQuery.isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-96 bg-slate-100 rounded-xl" />
          <div className="h-96 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (jobQuery.isError || !job) {
    return (
      <EmptyState
        icon={BriefcaseBusiness}
        title="Job Listing Not Found"
        description="The requested listing could not be found in the moderation registry."
        action={
          <Button asChild size="sm">
            <Link href={`${basePath}/jobs`}>
              <ArrowLeft size={14} /> Back to Queue
            </Link>
          </Button>
        }
      />
    );
  }

  const isClaimedByMe = job.reviewer?.id === currentUser?.id;
  const isSuperAdmin = currentRole === 'SUPER_ADMIN';
  const canModerate = isClaimedByMe || isSuperAdmin;

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`${basePath}/jobs`}
        backLabel="Back to Queue"
        eyebrow="CAMPUS COMPLIANCE & SAFETY"
        title={job.title}
        description={`${job.company} · ${job.location || 'Remote'} · ${job.employmentType || 'Full-time'}`}
        badge={
          <div className="flex items-center gap-2">
            <StatusBadge status={job.status || 'SUBMITTED'} />
            {job.reviewer ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Lock size={11} /> Reviewer: {isClaimedByMe ? 'You' : job.reviewer.name}
              </Badge>
            ) : (
              <Badge variant="warning" className="flex items-center gap-1">
                <Unlock size={11} /> Unclaimed
              </Badge>
            )}
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            {!job.reviewer && (
              <Button size="sm" onClick={() => claimMutation.mutate()} disabled={claimMutation.isPending}>
                <Lock size={14} /> Claim Review
              </Button>
            )}

            {isClaimedByMe && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => unclaimMutation.mutate()}
                disabled={unclaimMutation.isPending}
              >
                Release Claim
              </Button>
            )}

            {canModerate && job.status !== 'PUBLISHED' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsChangesModalOpen(true)}
                  className="text-amber-700 border-amber-300 hover:bg-amber-50"
                >
                  Request Changes
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsRejectModalOpen(true)}
                  className="text-rose-600 hover:bg-rose-50"
                >
                  Reject
                </Button>

                <Button
                  size="sm"
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  <Check size={14} /> Approve & Publish
                </Button>
              </>
            )}
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

      {/* Security Risk Hints */}
      {job.riskHints && job.riskHints.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
          <ShieldAlert size={22} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-rose-900 m-0">Automated Risk Detection Flags</h3>
            <ul className="text-xs text-rose-800 list-disc pl-4 m-0 space-y-0.5">
              {job.riskHints.map((hint, idx) => (
                <li key={idx}>{hint}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Details & Moderation History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Details Card */}
          <Card className="p-6 space-y-5 shadow-xs">
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-400 m-0">
              LISTING SPECIFICATION
            </h2>

            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-1">Description</span>
              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line p-4 bg-slate-50 border border-slate-100 rounded-xl">
                {job.description}
              </div>
            </div>

            {job.requirements && (
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-1">Requirements</span>
                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  {job.requirements}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Salary</span>
                <strong className="text-slate-800">{job.salary || 'Negotiable'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Work Mode</span>
                <strong className="text-slate-800">{job.workMode || 'On-site'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Experience</span>
                <strong className="text-slate-800">{job.experienceLevel || 'Open'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Deadline</span>
                <strong className="text-slate-800">
                  {job.deadline ? formatDate(job.deadline) : 'Rolling'}
                </strong>
              </div>
            </div>
          </Card>

          {/* Moderation History Audit Log */}
          <Card className="p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-400 m-0 flex items-center gap-2">
              <History size={16} /> Moderation Audit History
            </h2>

            {job.moderationHistory && job.moderationHistory.length > 0 ? (
              <div className="space-y-3">
                {job.moderationHistory.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="neutral">{m.action}</Badge>
                        {m.reasonCode && (
                          <span className="text-[11px] font-semibold text-rose-700">
                            [{m.reasonCode}]
                          </span>
                        )}
                        <span className="font-bold text-slate-800">
                          {m.actor?.name || 'System'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{formatDate(m.createdAt)}</span>
                    </div>

                    {m.ownerVisibleNote && (
                      <p className="text-slate-700 m-0 pt-1">
                        <strong>Public Note:</strong> {m.ownerVisibleNote}
                      </p>
                    )}

                    {m.internalNote && (
                      <p className="text-slate-500 italic m-0 pt-0.5 text-[11px]">
                        <strong>Internal Audit Note:</strong> {m.internalNote}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 m-0">No past moderation events recorded.</p>
            )}
          </Card>
        </div>

        {/* Right Column: Poster Dossier & Compliance Panel */}
        <div className="space-y-6">
          {/* Poster Dossier */}
          {job.postedBy && (
            <Card className="p-5 space-y-4 shadow-xs">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 m-0">
                AUTHOR VERIFICATION DOSSIER
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Author Full Name</span>
                  <strong className="text-slate-900 flex items-center gap-1">
                    {job.postedBy.name}
                    {job.postedBy.verified && <UserCheck size={14} className="text-blue-600" />}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">University Email</span>
                  <span className="text-slate-800 font-medium">{job.postedBy.email}</span>
                </div>

                {job.postedBy.phone && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Phone Number</span>
                    <span className="text-slate-800 font-medium">{job.postedBy.phone}</span>
                  </div>
                )}

                <div>
                  <span className="text-slate-400 block text-[11px]">Academic Department & Batch</span>
                  <span className="text-slate-800 font-medium">
                    {job.postedBy.department || 'N/A'} {job.postedBy.batch ? `· ${job.postedBy.batch}` : ''}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Current Employment</span>
                  <span className="text-slate-800 font-medium">
                    {job.postedBy.position ? `${job.postedBy.position} at ` : ''}
                    {job.postedBy.currentCompany || 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Institutional Accreditation</span>
                  <Badge variant={job.postedBy.verified ? 'success' : 'neutral'}>
                    {job.postedBy.verified ? 'Identity Verified' : 'Standard Member'}
                  </Badge>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <Button variant="ghost" size="sm" asChild className="w-full text-xs">
                  <Link href={`${basePath}/directory/${job.postedBy.id}`}>
                    Inspect Author Profile
                  </Link>
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 m-0 flex items-center gap-2">
              <XCircle size={18} className="text-rose-600" /> Reject Job Posting
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason Code *
                </label>
                <select
                  value={rejectReasonCode}
                  onChange={(e) => setRejectReasonCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                >
                  <option value="POLICY_VIOLATION">Institutional Policy Violation</option>
                  <option value="SCAM_OR_SUSPICIOUS">Suspicious / Unverified Company</option>
                  <option value="UNREALISTIC_COMPENSATION">Misleading Compensation</option>
                  <option value="EXTERNAL_CONTACT_VIOLATION">Prohibited Direct Contact</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Author-Visible Rejection Notice *
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this listing violates campus guidelines…"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Internal Audit Log Note
                </label>
                <input
                  type="text"
                  value={rejectInternalNote}
                  onChange={(e) => setRejectInternalNote(e.target.value)}
                  placeholder="Optional internal note…"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                onClick={() => rejectMutation.mutate()}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Request Changes Modal */}
      {isChangesModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 m-0 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-600" /> Request Revisions from Author
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Revision Instructions *
                </label>
                <textarea
                  rows={4}
                  value={changesNotes}
                  onChange={(e) => setChangesNotes(e.target.value)}
                  placeholder="Detail the exact corrections needed…"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Internal Audit Note
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
              <Button variant="outline" size="sm" onClick={() => setIsChangesModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!changesNotes.trim() || changesMutation.isPending}
                onClick={() => changesMutation.mutate()}
              >
                Send Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
