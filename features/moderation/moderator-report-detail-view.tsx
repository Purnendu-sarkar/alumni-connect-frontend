'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  History,
  Lock,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
  UserCheck,
  UserX,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import {
  claimReport,
  getAdminReportById,
  getModeratorReportById,
  liftRestriction,
  overturnReport,
  reassignReport,
  rejectReport,
  resolveReport,
  takeOverReport,
  type ReportItem,
  type ResolveReportInput,
  type RestrictionType,
} from '@/lib/api/reports.api';
import { getApiErrorMessage } from '@/lib/api/error-utils';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface ModeratorReportDetailViewProps {
  id: string;
  currentRole: UserRole;
  basePath: string;
}

export function ModeratorReportDetailView({ id, currentRole, basePath }: ModeratorReportDetailViewProps) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modals
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveActionType, setResolveActionType] = useState<ResolveReportInput['actionType']>('NONE');
  const [resolveNote, setResolveNote] = useState('');
  const [restrictionType, setRestrictionType] = useState<RestrictionType>('MESSAGING');
  const [durationDays, setDurationDays] = useState(3);
  const [publicMessage, setPublicMessage] = useState('');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNote, setRejectNote] = useState('');

  const [showOverturnModal, setShowOverturnModal] = useState(false);
  const [overturnReason, setOverturnReason] = useState('');

  const [showReassignModal, setShowReassignModal] = useState(false);
  const [targetModeratorId, setTargetModeratorId] = useState('');

  const [liftingRestrictionId, setLiftingRestrictionId] = useState<string | null>(null);
  const [liftReason, setLiftReason] = useState('');

  const reportQuery = useQuery({
    queryKey: ['report', id, currentRole],
    queryFn: async () => {
      const res =
        currentRole === 'SUPER_ADMIN'
          ? await getAdminReportById(id, accessToken)
          : await getModeratorReportById(id, accessToken);
      return res.data;
    },
    enabled: Boolean(id && accessToken),
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (currentRole === 'SUPER_ADMIN') {
        return takeOverReport(id, accessToken);
      }
      return claimReport(id, accessToken);
    },
    onSuccess: () => {
      setActionNotice('Report successfully claimed.');
      setTimeout(() => setActionNotice(null), 4000);
      void queryClient.invalidateQueries({ queryKey: ['report', id] });
    },
    onError: (err: unknown) => {
      setActionError(getApiErrorMessage(err, 'Failed to claim report.'));
      setTimeout(() => setActionError(null), 4000);
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (data: ResolveReportInput) => {
      return resolveReport(id, data, accessToken);
    },
    onSuccess: () => {
      setActionNotice('Report resolved and sanctions applied.');
      setShowResolveModal(false);
      setResolveNote('');
      setTimeout(() => setActionNotice(null), 4000);
      void queryClient.invalidateQueries({ queryKey: ['report', id] });
    },
    onError: (err: unknown) => {
      setActionError(getApiErrorMessage(err, 'Failed to resolve report.'));
      setTimeout(() => setActionError(null), 4000);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (note: string) => {
      return rejectReport(id, { resolutionNote: note }, accessToken);
    },
    onSuccess: () => {
      setActionNotice('Report dismissed as non-violating.');
      setShowRejectModal(false);
      setRejectNote('');
      setTimeout(() => setActionNotice(null), 4000);
      void queryClient.invalidateQueries({ queryKey: ['report', id] });
    },
    onError: (err: unknown) => {
      setActionError(getApiErrorMessage(err, 'Failed to dismiss report.'));
      setTimeout(() => setActionError(null), 4000);
    },
  });

  const overturnMutation = useMutation({
    mutationFn: async (reason: string) => {
      return overturnReport(id, { overturnReason: reason }, accessToken);
    },
    onSuccess: () => {
      setActionNotice('Moderation decision overturned and sanctions vacated.');
      setShowOverturnModal(false);
      setOverturnReason('');
      setTimeout(() => setActionNotice(null), 4000);
      void queryClient.invalidateQueries({ queryKey: ['report', id] });
    },
    onError: (err: unknown) => {
      setActionError(getApiErrorMessage(err, 'Failed to overturn decision.'));
      setTimeout(() => setActionError(null), 4000);
    },
  });

  const reassignMutation = useMutation({
    mutationFn: async (modId: string) => {
      return reassignReport(id, { moderatorId: modId }, accessToken);
    },
    onSuccess: () => {
      setActionNotice('Report reassigned successfully.');
      setShowReassignModal(false);
      setTargetModeratorId('');
      setTimeout(() => setActionNotice(null), 4000);
      void queryClient.invalidateQueries({ queryKey: ['report', id] });
    },
    onError: (err: unknown) => {
      setActionError(getApiErrorMessage(err, 'Failed to reassign report.'));
      setTimeout(() => setActionError(null), 4000);
    },
  });

  const liftRestrictionMutation = useMutation({
    mutationFn: async ({ restrictionId, reason }: { restrictionId: string; reason: string }) => {
      return liftRestriction(restrictionId, { revokeReason: reason }, accessToken);
    },
    onSuccess: () => {
      setActionNotice('Restriction lifted early and privileges restored.');
      setLiftingRestrictionId(null);
      setLiftReason('');
      setTimeout(() => setActionNotice(null), 4000);
      void queryClient.invalidateQueries({ queryKey: ['report', id] });
    },
    onError: (err: unknown) => {
      setActionError(getApiErrorMessage(err, 'Failed to lift restriction.'));
      setTimeout(() => setActionError(null), 4000);
    },
  });

  if (reportQuery.isLoading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200 animate-pulse">
        Loading incident report inspection details…
      </div>
    );
  }

  const report = reportQuery.data;
  if (!report) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200 space-y-3">
        <p>Incident report #{id} was not found or has been purged.</p>
        <Button asChild size="sm" variant="outline">
          <Link href={`${basePath}/reports`}>Back to Reports Queue</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Link
          href={`${basePath}/reports`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Reports Queue
        </Link>
        <PageHeader
          eyebrow={`REPORT ID #${report.id.toUpperCase()}`}
          title={`Safety Incident: ${report.type}`}
          badge={<StatusBadge status={report.status} />}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {report.status === 'OPEN' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => claimMutation.mutate()}
                  disabled={claimMutation.isPending}
                  className="gap-1.5"
                >
                  <UserCheck size={13} />
                  <span>{currentRole === 'SUPER_ADMIN' ? 'Take Over' : 'Claim Investigation'}</span>
                </Button>
              )}

              {(report.status === 'OPEN' || report.status === 'UNDER_REVIEW') && (
                <>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                    onClick={() => {
                      setShowResolveModal(true);
                      setResolveActionType(
                        report.targetType === 'JOB' || report.targetType === 'STORY' ? 'HIDE_CONTENT' : 'NONE',
                      );
                    }}
                  >
                    <CheckCircle2 size={13} />
                    <span>Take Action & Resolve</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-500 hover:text-slate-700"
                    onClick={() => setShowRejectModal(true)}
                  >
                    <XCircle size={13} />
                    <span>Dismiss</span>
                  </Button>
                </>
              )}

              {currentRole === 'SUPER_ADMIN' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowReassignModal(true)}
                    className="gap-1.5"
                  >
                    <span>Reassign</span>
                  </Button>
                  {report.status === 'RESOLVED' && !report.overturnedAt && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setShowOverturnModal(true)}
                      className="gap-1.5"
                    >
                      <RotateCcw size={13} />
                      <span>Overturn Decision</span>
                    </Button>
                  )}
                </>
              )}
            </div>
          }
        />
      </div>

      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2 animate-in fade-in">
          <AlertTriangle size={16} className="text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {report.overturnedAt && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <RotateCcw size={14} className="text-amber-700" />
            <span>Moderation Decision Overturned by Super Admin</span>
          </div>
          <p className="m-0 leading-relaxed text-amber-800">
            <strong>Reason:</strong> {report.overturnReason || 'Administrative relief granted.'}
          </p>
        </div>
      )}

      {/* Primary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Details & Snapshot */}
        <div className="md:col-span-2 space-y-6">
          {/* Reason & Narrative */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Reported Violation Reason
              </span>
              <span className="text-xs text-slate-400">
                Created {new Date(report.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900 m-0 leading-relaxed">
              &quot;{report.reason}&quot;
            </p>

            {report.resolutionNote && (
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <strong className="block text-emerald-900 font-bold">Formal Resolution Note:</strong>
                <p className="m-0 leading-relaxed">{report.resolutionNote}</p>
                <div className="text-[10px] text-emerald-700 font-mono mt-1">
                  Resolved by {report.resolver?.name || 'Staff'} on{' '}
                  {report.resolvedAt ? new Date(report.resolvedAt).toLocaleString() : 'N/A'}
                </div>
              </div>
            )}
          </div>

          {/* Immutable Captured Snapshot Evidence */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-blue-600" />
                Immutable Server-Captured Evidence Snapshot
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Target: {report.targetType}</span>
            </div>
            {report.snapshot ? (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                {Object.entries(report.snapshot).map(([key, val]) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 py-1 border-b border-slate-100 last:border-b-0">
                    <span className="font-semibold text-slate-600 text-[11px] capitalize">{key}:</span>
                    <span className="font-mono text-slate-800 text-right break-all text-[11px]">
                      {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No snapshot recorded.</p>
            )}
          </div>

          {/* Audit Action Timeline */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-3 border-b border-slate-100 m-0">
              <History size={14} className="text-blue-600" />
              Investigation & Action Timeline ({report.actions?.length || 0})
            </h4>

            {!report.actions || report.actions.length === 0 ? (
              <p className="text-xs text-slate-500 italic m-0">No actions recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {report.actions.map((act) => (
                  <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        {act.actionType} by {act.actor.name} ({act.actorRole})
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(act.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {act.note && <p className="text-slate-600 m-0">{act.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Metadata & Subject Info */}
        <div className="space-y-6">
          {/* Target Metadata Card */}
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 m-0">
              Target Entity
            </h4>
            <div className="text-xs space-y-2">
              <div>
                <span className="text-slate-500 block text-[11px]">Type:</span>
                <span className="font-bold text-slate-800">{report.targetType}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Target Identifier:</span>
                <span className="font-mono text-slate-800 font-medium break-all">{report.targetId}</span>
              </div>
              {report.linkedReportsCount !== undefined && report.linkedReportsCount > 0 && (
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-xs">
                  <span className="font-bold">{report.linkedReportsCount}</span> other report(s) filed on this target.
                </div>
              )}
            </div>
          </div>

          {/* Subject User Card */}
          {report.reportedUser && (
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 m-0">
                Reported Member
              </h4>
              <div className="text-xs space-y-1.5">
                <p className="font-bold text-slate-900 m-0">{report.reportedUser.name}</p>
                <p className="text-slate-500 m-0">{report.reportedUser.email}</p>
                <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {report.reportedUser.role}
                </span>

                {report.activeRestrictions && report.activeRestrictions.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <span className="text-[11px] font-bold text-rose-700 block">Active Restrictions:</span>
                    {report.activeRestrictions.map((rst) => (
                      <div key={rst.id} className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-[11px] space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span>{rst.type}</span>
                          {currentRole === 'SUPER_ADMIN' && (
                            <button
                              type="button"
                              onClick={() => setLiftingRestrictionId(rst.id)}
                              className="text-rose-600 hover:text-rose-800 underline text-[10px]"
                            >
                              Lift
                            </button>
                          )}
                        </div>
                        <p className="m-0 text-[10px]">Ends: {new Date(rst.endsAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Confidential Reporter Card */}
          {report.reportedBy && (
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 m-0 flex items-center gap-1.5">
                <Lock size={12} className="text-slate-400" />
                Confidential Reporter
              </h4>
              <p className="text-xs font-semibold text-slate-900 m-0">{report.reportedBy.name}</p>
              <p className="text-xs text-slate-500 m-0">{report.reportedBy.email}</p>
              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {report.reportedBy.role}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
                <ShieldAlert size={16} className="text-blue-600" />
                Take Action & Resolve Report #{report.id}
              </h3>
              <button
                type="button"
                onClick={() => setShowResolveModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                resolveMutation.mutate({
                  actionType: resolveActionType,
                  resolutionNote: resolveNote.trim(),
                  restrictionType: resolveActionType === 'RESTRICT_USER' ? restrictionType : undefined,
                  durationDays: resolveActionType === 'RESTRICT_USER' ? durationDays : undefined,
                  publicMessageToTarget: publicMessage.trim() || undefined,
                });
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sanction / Action Type</label>
                <select
                  value={resolveActionType}
                  onChange={(e) => setResolveActionType(e.target.value as ResolveReportInput['actionType'])}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="NONE">No Sanctions (Record Closed)</option>
                  <option value="HIDE_CONTENT">Hide / Close Content Listing</option>
                  <option value="WARN_USER">Issue Formal Warning to Subject</option>
                  <option value="RESTRICT_USER">Apply Temporary Restriction (1-7 Days)</option>
                  <option value="ESCALATE">Escalate to Super Admin</option>
                </select>
              </div>

              {resolveActionType === 'RESTRICT_USER' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-rose-900 mb-1">Restricted Privilege</label>
                    <select
                      value={restrictionType}
                      onChange={(e) => setRestrictionType(e.target.value as RestrictionType)}
                      className="w-full px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs"
                    >
                      <option value="MESSAGING">Messaging Privileges</option>
                      <option value="JOB_POSTING">Job Posting Privileges</option>
                      <option value="MENTORSHIP_REQUESTS">Mentorship Request Privileges</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-rose-900 mb-1">Duration (1 - 7 Days)</label>
                    <input
                      type="number"
                      min={1}
                      max={7}
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              {resolveActionType === 'WARN_USER' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notice Message to Reported Member</label>
                  <textarea
                    rows={2}
                    value={publicMessage}
                    onChange={(e) => setPublicMessage(e.target.value)}
                    placeholder="State the guidelines violated and required conduct adjustments..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Investigation & Resolution Note <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  placeholder="Summarize evidence review, steps taken, and reasoning..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowResolveModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={resolveMutation.isPending || resolveNote.trim().length < 5}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {resolveMutation.isPending ? 'Applying…' : 'Confirm Resolution'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dismiss Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 m-0">Dismiss Incident Report #{report.id}</h3>
            <p className="text-xs text-slate-500 m-0">
              Provide justification for closing this report without punitive sanctions.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                rejectMutation.mutate(rejectNote.trim());
              }}
              className="space-y-3 text-xs"
            >
              <textarea
                rows={3}
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="e.g. Content was verified as compliant with campus guidelines..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                required
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={rejectMutation.isPending || rejectNote.trim().length < 5}
                >
                  {rejectMutation.isPending ? 'Dismissing…' : 'Confirm Dismissal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overturn Modal */}
      {showOverturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
              <RotateCcw size={16} className="text-rose-600" />
              Overturn Moderator Decision
            </h3>
            <p className="text-xs text-slate-500 m-0">
              This executive override will vacate penalties, restore hidden content, and notify the moderator.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                overturnMutation.mutate(overturnReason.trim());
              }}
              className="space-y-3 text-xs"
            >
              <textarea
                rows={3}
                value={overturnReason}
                onChange={(e) => setOverturnReason(e.target.value)}
                placeholder="State the administrative justification for overturning this resolution..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                required
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowOverturnModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={overturnMutation.isPending || overturnReason.trim().length < 5}
                >
                  {overturnMutation.isPending ? 'Overturning…' : 'Confirm Overturn'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reassign Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 m-0">Reassign Report to Moderator</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                reassignMutation.mutate(targetModeratorId.trim());
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Moderator User ID</label>
                <input
                  type="text"
                  value={targetModeratorId}
                  onChange={(e) => setTargetModeratorId(e.target.value)}
                  placeholder="e.g. cxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowReassignModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={reassignMutation.isPending || !targetModeratorId.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {reassignMutation.isPending ? 'Reassigning…' : 'Confirm Reassign'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lift Restriction Early Modal */}
      {liftingRestrictionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 m-0">Lift User Restriction Early</h3>
            <p className="text-xs text-slate-500 m-0">
              This will immediately reinstate the member&apos;s campus privileges and notify them.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                liftRestrictionMutation.mutate({
                  restrictionId: liftingRestrictionId,
                  reason: liftReason.trim(),
                });
              }}
              className="space-y-3 text-xs"
            >
              <textarea
                rows={3}
                value={liftReason}
                onChange={(e) => setLiftReason(e.target.value)}
                placeholder="State the justification for early reinstatement..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                required
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setLiftingRestrictionId(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={liftRestrictionMutation.isPending || liftReason.trim().length < 5}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {liftRestrictionMutation.isPending ? 'Lifting…' : 'Confirm Reinstatement'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
