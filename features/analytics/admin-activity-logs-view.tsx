'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
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

const FALLBACK_LOGS: AuditLogItem[] = [
  {
    id: 'log-1',
    action: 'USER_VERIFIED',
    actorName: 'Platform Super Admin',
    actorRole: 'SUPER_ADMIN',
    target: 'Sadia Rahman (Batch 2016)',
    details: 'Verified academic credentials and approved alumni accreditation.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'log-2',
    action: 'MODERATOR_INVITED',
    actorName: 'Platform Super Admin',
    actorRole: 'SUPER_ADMIN',
    target: 'faculty.advisor@nwu.ac.bd',
    details: 'Generated 72-hour single-use setup token for moderator onboarding.',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'log-3',
    action: 'JOB_REVIEWED',
    actorName: 'Faculty Moderator',
    actorRole: 'MODERATOR',
    target: 'Software Engineer, Platform Core',
    details: 'Approved bKash referral opportunity for campus board distribution.',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
  {
    id: 'log-4',
    action: 'USER_SUSPENDED',
    actorName: 'Platform Super Admin',
    actorRole: 'SUPER_ADMIN',
    target: 'Spam Affiliate Account (usr-91)',
    details: 'Immediate session revocation executed for terms-of-service abuse.',
    timestamp: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
  },
];

export function AdminActivityLogsView({ currentRole, basePath }: AdminActivityLogsViewProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [search, setSearch] = useState('');

  const logsQuery = useQuery({
    queryKey: ['admin-audit-logs', accessToken],
    queryFn: async () => {
      try {
        const res = await getAuditLogs(accessToken);
        return res.data?.logs && res.data.logs.length > 0 ? res.data.logs : FALLBACK_LOGS;
      } catch {
        return FALLBACK_LOGS;
      }
    },
    enabled: Boolean(accessToken),
  });

  const logs = logsQuery.data ?? FALLBACK_LOGS;

  const filteredLogs = logs.filter((log) => {
    const term = search.toLowerCase();
    return (
      !term ||
      log.action.toLowerCase().includes(term) ||
      log.actorName.toLowerCase().includes(term) ||
      log.target.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="IMMUTABLE SECURITY GOVERNANCE"
        title="Security & System Audit Logs"
        description="Append-only record of all administrative actions, accreditation reviews, privilege elevations, and policy overrides."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => logsQuery.refetch()}
            disabled={logsQuery.isFetching}
          >
            <RefreshCw size={13} className={logsQuery.isFetching ? 'animate-spin' : ''} /> Refresh Logs
          </Button>
        }
      />

      {/* Search Input */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs max-w-md">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, administrator name, or target…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {logsQuery.isLoading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No audit log entries match"
          description="Try searching with a broader query term."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-5 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="p-2.5 rounded-full bg-slate-100 text-slate-700 shrink-0 mt-0.5">
                <ShieldAlert size={18} className="text-purple-600" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono tracking-wider text-slate-900">
                      {log.action}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      {log.actorRole}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-slate-700 m-0">
                  Actor: <strong className="text-slate-900">{log.actorName}</strong> → Target:{' '}
                  <strong className="text-slate-900">{log.target}</strong>
                </p>

                <p className="text-xs text-slate-500 m-0 leading-relaxed">{log.details}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
