'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  AlertOctagon,
  Calendar,
  Code2,
  ExternalLink,
  Eye,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { TableSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { getAuditLogs, type AuditLogItem } from '@/lib/api/admin.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface AdminActivityLogsViewProps {
  currentRole: UserRole;
  basePath: string;
}

const ACTION_OPTIONS = [
  { value: 'ALL', label: 'All Security Actions' },
  { value: 'USER_REGISTERED', label: 'User Registered' },
  { value: 'LOGIN_SUCCESS', label: 'Login Success' },
  { value: 'LOGIN_FAILED', label: 'Login Failed / Blocked' },
  { value: 'FORBIDDEN_ACCESS', label: 'Forbidden Access Attempt' },
  { value: 'EMAIL_VERIFIED', label: 'Email Verified' },
  { value: 'USER_VERIFIED', label: 'Accreditation Approved' },
  { value: 'USER_VERIFICATION_REJECTED', label: 'Accreditation Rejected' },
  { value: 'VERIFICATION_RESUBMITTED', label: 'Accreditation Resubmitted' },
  { value: 'MODERATOR_INVITED', label: 'Moderator Invited' },
  { value: 'MODERATOR_SETUP_COMPLETED', label: 'Moderator Setup Completed' },
  { value: 'USER_SUSPENDED', label: 'User Suspended' },
  { value: 'USER_RESTORED', label: 'User Restored' },
  { value: 'USER_SESSIONS_TERMINATED', label: 'User Sessions Terminated' },
  { value: 'PASSWORD_RESET_COMPLETED', label: 'Password Reset' },
  { value: 'PASSWORD_CHANGED', label: 'Password Changed' },
  { value: 'SESSION_REUSE_DETECTED', label: 'Session Reuse Detected' },
  { value: 'JOB_APPROVED', label: 'Job Approved' },
  { value: 'JOB_REJECTED', label: 'Job Rejected' },
  { value: 'CONNECTION_ACCEPTED', label: 'Connection Accepted' },
];

export function AdminActivityLogsView({ currentRole, basePath }: AdminActivityLogsViewProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [resultFilter, setResultFilter] = useState<'ALL' | 'SUCCESS' | 'FAILURE'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [inspectLog, setInspectLog] = useState<AuditLogItem | null>(null);

  // 300ms Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const hasActiveFilters = Boolean(
    search || actionFilter !== 'ALL' || resultFilter !== 'ALL' || startDate || endDate
  );

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setActionFilter('ALL');
    setResultFilter('ALL');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const logsQuery = useQuery({
    queryKey: [
      'admin-audit-logs',
      page,
      debouncedSearch,
      actionFilter,
      resultFilter,
      startDate,
      endDate,
      accessToken,
    ],
    queryFn: async () => {
      const res = await getAuditLogs(accessToken, {
        page,
        limit: 25,
        search: debouncedSearch || undefined,
        action: actionFilter !== 'ALL' ? actionFilter : undefined,
        result: resultFilter !== 'ALL' ? resultFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      const items: AuditLogItem[] = Array.isArray(res.data) ? res.data : [];

      return {
        logs: items,
        meta: res.meta ?? { page, limit: 25, total: items.length, totalPages: 1 },
      };
    },
    enabled: Boolean(accessToken),
  });

  const logs = logsQuery.data?.logs ?? [];
  const meta = logsQuery.data?.meta ?? { page: 1, limit: 25, total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="IMMUTABLE SECURITY GOVERNANCE"
        title="Security & System Audit Logs"
        description="Append-only record of all administrative actions, authentication attempts, accreditation reviews and security violations."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => logsQuery.refetch()}
            disabled={logsQuery.isFetching}
          >
            <RefreshCw size={13} className={logsQuery.isFetching ? 'animate-spin mr-1.5' : 'mr-1.5'} /> Refresh Logs
          </Button>
        }
      />

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by action, actor, target, IP, or Request ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Result Filter */}
          <div>
            <select
              value={resultFilter}
              onChange={(e) => {
                setResultFilter(e.target.value as 'ALL' | 'SUCCESS' | 'FAILURE');
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">All Outcomes (Success & Failure)</option>
              <option value="SUCCESS">Success Only</option>
              <option value="FAILURE">Failure & Violations</option>
            </select>
          </div>
        </div>

        {/* Date Range & Reset Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400" /> Date Range:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">From</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">To</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {hasActiveFilters ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleResetFilters}
              className="text-xs text-slate-600 hover:text-slate-900 h-8 px-2.5"
            >
              <RotateCcw size={12} className="mr-1" /> Reset Filters
            </Button>
          ) : null}
        </div>
      </div>

      {logsQuery.isLoading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No security audit log entries match"
          description="Try broadening your search query or adjusting the action and outcome filters."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {logs.map((log) => {
            const isFailure = log.result === 'FAILURE';

            return (
              <div key={log.id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-slate-50/60 transition-colors">
                <div
                  className={`p-2.5 rounded-full shrink-0 mt-0.5 ${
                    isFailure ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {isFailure ? <AlertOctagon size={18} /> : <ShieldAlert size={18} className="text-purple-600" />}
                </div>

                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold font-mono tracking-wider text-slate-900">
                        {log.action}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        {log.actorRole}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isFailure
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {log.result ?? 'SUCCESS'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 m-0 leading-relaxed">
                    Actor:{' '}
                    {log.actorId ? (
                      <Link
                        href={`/admin/users/${log.actorId}`}
                        className="font-bold text-slate-900 hover:text-blue-600 hover:underline inline-flex items-center gap-0.5"
                        title="Inspect Actor Profile"
                      >
                        {log.actorName}
                        <ExternalLink size={10} className="text-slate-400" />
                      </Link>
                    ) : (
                      <strong className="text-slate-700">{log.actorName || 'System / Deleted User'}</strong>
                    )}
                    {log.actorEmail ? ` (${log.actorEmail})` : ''} → Target:{' '}
                    {log.targetType === 'USER' && log.targetId ? (
                      <Link
                        href={`/admin/users/${log.targetId}`}
                        className="font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-0.5"
                        title="Inspect Target User"
                      >
                        {log.target}
                        <ExternalLink size={10} className="text-blue-400" />
                      </Link>
                    ) : (
                      <strong className="text-slate-900">{log.target}</strong>
                    )}
                  </p>

                  <p className="text-xs text-slate-500 m-0 leading-relaxed">{log.details}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-mono pt-1">
                    {log.ip ? <span>IP: {log.ip}</span> : null}
                    {log.requestId ? <span>ReqID: {log.requestId}</span> : null}
                    {log.metadata ? (
                      <button
                        type="button"
                        onClick={() => setInspectLog(log)}
                        className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-sans"
                      >
                        <Eye size={11} /> View Metadata
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {meta.totalPages > 1 ? (
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>
            Showing Page <strong>{meta.page}</strong> of <strong>{meta.totalPages}</strong> ({meta.total} audit records)
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      {/* Expandable Metadata Inspection Modal */}
      {inspectLog ? (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Code2 size={18} className="text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 m-0">Audit Record Forensics</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectLog(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Security Action:</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {inspectLog.action}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Actor Entity:</span>
                <div>
                  {inspectLog.actorId ? (
                    <Link
                      href={`/admin/users/${inspectLog.actorId}`}
                      className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                      title="Inspect Actor Profile"
                    >
                      {inspectLog.actorName} ({inspectLog.actorRole})
                      <ExternalLink size={11} />
                    </Link>
                  ) : (
                    <strong className="text-slate-800">
                      {inspectLog.actorName || 'System / Deleted User'} ({inspectLog.actorRole})
                    </strong>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Target Entity:</span>
                <div>
                  {inspectLog.targetType === 'USER' && inspectLog.targetId ? (
                    <Link
                      href={`/admin/users/${inspectLog.targetId}`}
                      className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                      title="Inspect Target User"
                    >
                      {inspectLog.target}
                      <ExternalLink size={11} />
                    </Link>
                  ) : (
                    <strong className="text-slate-900">{inspectLog.target}</strong>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span className="font-mono text-slate-700">
                  {new Date(inspectLog.timestamp).toLocaleString()}
                </span>
              </div>
              {inspectLog.ip ? (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Origin IP:</span>
                  <span className="font-mono text-slate-700">{inspectLog.ip}</span>
                </div>
              ) : null}
              {inspectLog.requestId ? (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Request ID:</span>
                  <span className="font-mono text-slate-700 text-[10px]">{inspectLog.requestId}</span>
                </div>
              ) : null}
              {inspectLog.userAgent ? (
                <div className="space-y-1 pt-1 border-t border-slate-100">
                  <span className="text-slate-500 block text-[11px]">User Agent:</span>
                  <p className="font-mono text-slate-600 text-[10px] break-all bg-slate-50 p-2 rounded border border-slate-100 m-0">
                    {inspectLog.userAgent}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 text-[11px] font-semibold">Structured Metadata:</span>
              <div className="bg-slate-950 text-slate-100 rounded-xl p-4 font-mono text-[11px] overflow-x-auto max-h-48">
                <pre>{JSON.stringify(inspectLog.metadata, null, 2)}</pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="secondary" onClick={() => setInspectLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
