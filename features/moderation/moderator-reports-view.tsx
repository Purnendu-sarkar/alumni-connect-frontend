'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import {
  claimReport,
  getAdminReports,
  getModeratorReports,
  rejectReport,
  resolveReport,
  takeOverReport,
  type ReportItem,
  type ReportTargetType,
  type ResolveReportInput,
  type RestrictionType,
} from '@/lib/api/reports.api';
import { getApiErrorMessage } from '@/lib/api/error-utils';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface ModeratorReportsViewProps {
  currentRole: UserRole;
  basePath: string;
  filterOpenOnly?: boolean;
}

export function ModeratorReportsView({
  currentRole,
  basePath,
  filterOpenOnly = false,
}: ModeratorReportsViewProps) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentUser = useAuthStore((state) => state.user);

  const [search, setSearch] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Resolve Modal State
  const [resolvingReport, setResolvingReport] = useState<ReportItem | null>(null);
  const [resolveActionType, setResolveActionType] = useState<ResolveReportInput['actionType']>('NONE');
  const [resolveNote, setResolveNote] = useState('');
  const [restrictionType, setRestrictionType] = useState<RestrictionType>('MESSAGING');
  const [durationDays, setDurationDays] = useState(3);
  const [publicMessage, setPublicMessage] = useState('');

  // Reject Modal State
  const [rejectingReport, setRejectingReport] = useState<ReportItem | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const queryKey = [
    currentRole === 'SUPER_ADMIN' ? 'admin' : 'moderator',
    'reports',
    filterOpenOnly,
    targetTypeFilter,
    search,
  ];

  const reportsQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const params = {
        status: filterOpenOnly ? 'OPEN' : undefined,
        targetType: targetTypeFilter !== 'ALL' ? targetTypeFilter : undefined,
        q: search.trim() || undefined,
        limit: 50,
      };

      const res =
        currentRole === 'SUPER_ADMIN'
          ? await getAdminReports(params, accessToken)
          : await getModeratorReports(params, accessToken);

      return res.data ?? [];
    },
    enabled: Boolean(accessToken),
  });

  const claimMutation = useMutation({
    mutationFn: async (id: string) => {
      if (currentRole === 'SUPER_ADMIN') {
        return takeOverReport(id, accessToken);
      }
      return claimReport(id, accessToken);
    },
    onSuccess: () => {
      setActionNotice('Report claimed for formal investigation.');
      setTimeout(() => setActionNotice(null), 4000);
      void queryClient.invalidateQueries({ queryKey: ['moderator', 'reports'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    },
    onError: (err: unknown) => {
      setActionError(getApiErrorMessage(err, 'Failed to claim report.'));
      setTimeout(() => setActionError(null), 4000);
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ResolveReportInput }) => {
      return resolveReport(id, data, accessToken);
    },
    onSuccess: () => {
      setActionNotice('Report successfully resolved and sanctions applied.');
      setResolvingReport(null);
      setResolveNote('');
      setPublicMessage('');
      setTimeout(() => setActionNotice(null), 4000);
      void queryClient.invalidateQueries({ queryKey: ['moderator', 'reports'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    },
    onError: (err: unknown) => {
      setActionError(getApiErrorMessage(err, 'Failed to resolve report.'));
      setTimeout(() => setActionError(null), 4000);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      return rejectReport(id, { resolutionNote: note }, accessToken);
    },
    onSuccess: () => {
      setActionNotice('Report closed as non-violating.');
      setRejectingReport(null);
      setRejectNote('');
      setTimeout(() => setActionNotice(null), 4000);
      void queryClient.invalidateQueries({ queryKey: ['moderator', 'reports'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    },
    onError: (err: unknown) => {
      setActionError(getApiErrorMessage(err, 'Failed to dismiss report.'));
      setTimeout(() => setActionError(null), 4000);
    },
  });

  const reports = reportsQuery.data ?? [];

  const handleOpenResolveModal = (report: ReportItem) => {
    setResolvingReport(report);
    setResolveActionType(report.targetType === 'JOB' || report.targetType === 'STORY' ? 'HIDE_CONTENT' : 'NONE');
    setResolveNote('');
    setPublicMessage('');
  };

  const handleExecuteResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingReport) return;
    resolveMutation.mutate({
      id: resolvingReport.id,
      data: {
        actionType: resolveActionType,
        resolutionNote: resolveNote.trim(),
        restrictionType: resolveActionType === 'RESTRICT_USER' ? restrictionType : undefined,
        durationDays: resolveActionType === 'RESTRICT_USER' ? durationDays : undefined,
        publicMessageToTarget: publicMessage.trim() || undefined,
      },
    });
  };

  const handleExecuteReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingReport) return;
    rejectMutation.mutate({
      id: rejectingReport.id,
      note: rejectNote.trim(),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="COMMUNITY TRUST & SAFETY"
        title="Campus Incident & Abuse Reports"
        description="Investigate flagged profiles, fraudulent postings, spam, and code-of-conduct violations across the network."
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => reportsQuery.refetch()}
            disabled={reportsQuery.isFetching}
          >
            <RefreshCw size={13} className={reportsQuery.isFetching ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </Button>
        }
      />

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

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href={`${basePath}/reports/open`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterOpenOnly ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Open Queue
          </Link>
          <Link
            href={`${basePath}/reports`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              !filterOpenOnly ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Incident Reports ({reports.length})
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Target Type Filter */}
          <select
            value={targetTypeFilter}
            onChange={(e) => setTargetTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Types</option>
            <option value="USER">Members</option>
            <option value="JOB">Jobs</option>
            <option value="STORY">Stories</option>
            <option value="MESSAGE">Messages</option>
            <option value="EVENT">Events</option>
          </select>

          {/* Search box */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by reason or ID..."
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      {reportsQuery.isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200 animate-pulse">
          Loading safety incident reports queue…
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No reports in queue"
          description={
            filterOpenOnly
              ? 'There are currently no unresolved reports in the safety queue.'
              : 'No incident reports match your current filter parameters.'
          }
        />
      ) : (
        <div className="space-y-4">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3 transition-all hover:border-slate-300"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 tracking-wider">
                      {rep.targetType}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      {rep.type}
                    </span>
                    <StatusBadge status={rep.status} />
                    {rep.escalatedAt && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        ESCALATED
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 m-0 leading-snug">
                    {rep.reason}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    <span>
                      Target ID: <strong className="font-mono text-slate-700">{rep.targetId}</strong>
                    </span>
                    {rep.reportedUser && (
                      <span>
                        Subject: <strong className="text-slate-800">{rep.reportedUser.name}</strong> ({rep.reportedUser.role})
                      </span>
                    )}
                    {rep.reviewer && (
                      <span>
                        Claimed by: <strong className="text-blue-700">{rep.reviewer.name}</strong>
                      </span>
                    )}
                    <span>Reported: {new Date(rep.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`${basePath}/reports/${rep.id}`} className="gap-1.5">
                      <Eye size={13} />
                      <span>Inspect</span>
                    </Link>
                  </Button>

                  {rep.status === 'OPEN' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => claimMutation.mutate(rep.id)}
                      disabled={claimMutation.isPending}
                      className="gap-1.5"
                    >
                      <UserCheck size={13} />
                      <span>Claim</span>
                    </Button>
                  )}

                  {(rep.status === 'OPEN' || rep.status === 'UNDER_REVIEW') && (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleOpenResolveModal(rep)}
                        className="gap-1.5 bg-blue-600 hover:bg-blue-700"
                      >
                        <CheckCircle2 size={13} />
                        <span>Resolve</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setRejectingReport(rep)}
                        className="text-slate-500 hover:text-slate-700"
                      >
                        <XCircle size={13} />
                        <span>Dismiss</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Server Snapshot Summary */}
              {rep.snapshot && (
                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-100 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Captured Snapshot Evidence
                  </span>
                  <div className="font-mono text-[11px] text-slate-800 overflow-hidden line-clamp-2">
                    {String(
                      rep.snapshot.title ??
                        rep.snapshot.content ??
                        rep.snapshot.name ??
                        JSON.stringify(rep.snapshot),
                    )}
                  </div>
                </div>
              )}

              {rep.resolutionNote && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[11px] font-bold">Resolution Note:</strong>
                    <span>{rep.resolutionNote}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resolve Modal */}
      {resolvingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
                <ShieldAlert size={16} className="text-blue-600" />
                Resolve Incident Report #{resolvingReport.id}
              </h3>
              <button
                type="button"
                onClick={() => setResolvingReport(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleExecuteResolve} className="p-5 space-y-4 text-xs">
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
                <Button type="button" variant="ghost" size="sm" onClick={() => setResolvingReport(null)}>
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

      {/* Dismiss / Reject Modal */}
      {rejectingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 m-0">Dismiss Incident Report #{rejectingReport.id}</h3>
            <p className="text-xs text-slate-500 m-0">
              Provide justification for closing this report without punitive sanctions.
            </p>
            <form onSubmit={handleExecuteReject} className="space-y-3 text-xs">
              <textarea
                rows={3}
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="e.g. Content was verified as compliant with campus guidelines..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                required
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setRejectingReport(null)}>
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
    </div>
  );
}
