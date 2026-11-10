'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  UserX,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { demoReports, type ReportItem } from '@/features/shared/demo-data';
import type { UserRole } from '@/types/domain';

interface ModeratorReportsViewProps {
  currentRole: UserRole;
  basePath: string;
  filterOpenOnly?: boolean;
}

export function ModeratorReportsView({ currentRole, basePath, filterOpenOnly = false }: ModeratorReportsViewProps) {
  const [reports, setReports] = useState<ReportItem[]>(demoReports);
  const [activeReport, setActiveReport] = useState<ReportItem | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleResolve = (id: string, resolution: 'RESOLVED' | 'DISMISSED') => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: resolution,
              resolvedAt: new Date().toISOString(),
              resolutionNote: resolution === 'RESOLVED' ? 'Action taken & content sanctioned.' : 'Reviewed and dismissed as non-violating.',
            }
          : r
      )
    );
    setActiveReport(null);
    setActionNotice(`Report ${id} marked as ${resolution.toLowerCase()}.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const displayedReports = filterOpenOnly
    ? reports.filter((r) => r.status === 'OPEN' || r.status === 'IN_REVIEW')
    : reports;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="COMMUNITY TRUST & SAFETY"
        title="Campus Incident & Abuse Reports"
        description="Investigate flagged profiles, fraudulent postings, spam, and code-of-conduct violations across the network."
      />

      {actionNotice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      ) : null}

      {/* Tabs */}
      <div className="flex gap-2">
        <Link
          href={`${basePath}/reports/open`}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterOpenOnly ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Open & In-Review ({reports.filter((r) => r.status === 'OPEN' || r.status === 'IN_REVIEW').length})
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

      {displayedReports.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No open incident reports"
          description="There are currently no unresolved reports in the safety queue."
        />
      ) : (
        <div className="space-y-4">
          {displayedReports.map((rep) => (
            <div
              key={rep.id}
              className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      TYPE: {rep.type}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 m-0">{rep.reason}</h3>
                    <StatusBadge status={rep.status} />
                  </div>
                  <p className="text-xs text-slate-600 m-0">
                    Flagged Subject: <strong className="text-slate-900">{rep.targetTitle}</strong> (ID: {rep.targetId})
                  </p>
                  <p className="text-[11px] text-slate-400 m-0 mt-0.5">
                    Reported by: {rep.reportedBy} ({rep.reportedByRole}) · {new Date(rep.createdAt).toLocaleString()}
                  </p>
                </div>

                {rep.status === 'OPEN' || rep.status === 'IN_REVIEW' ? (
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleResolve(rep.id, 'RESOLVED')}
                    >
                      Take Action & Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleResolve(rep.id, 'DISMISSED')}
                    >
                      Dismiss Report
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg text-xs leading-relaxed text-slate-700">
                <strong className="block text-slate-900 mb-1">Report Details & Evidence:</strong>
                &quot;{rep.details}&quot;
              </div>

              {rep.resolutionNote ? (
                <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900">
                  <strong>Moderation Resolution:</strong> {rep.resolutionNote}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
