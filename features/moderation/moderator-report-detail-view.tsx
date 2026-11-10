'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  UserX,
  XCircle,
  FileText,
  User,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { demoReports, type ReportItem } from '@/features/shared/demo-data';
import type { UserRole } from '@/types/domain';

interface ModeratorReportDetailViewProps {
  id: string;
  currentRole: UserRole;
  basePath: string;
}

export function ModeratorReportDetailView({ id, currentRole, basePath }: ModeratorReportDetailViewProps) {
  const [report, setReport] = useState<ReportItem | null>(() => {
    return (
      demoReports.find((r) => r.id === id) || {
        id,
        type: 'JOB',
        targetId: 'job-999',
        targetTitle: 'Suspicious Job Listing',
        reason: 'Misleading compensation terms and external unverified link',
        details: 'Poster solicitated processing fee before scheduling an interview.',
        reportedBy: 'Tanvir Hossain',
        reportedByRole: 'STUDENT',
        status: 'OPEN',
        createdAt: '2026-11-09T14:30:00Z',
      }
    );
  });

  const [confirmResolution, setConfirmResolution] = useState<'RESOLVED' | 'DISMISSED' | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleResolve = (resolution: 'RESOLVED' | 'DISMISSED') => {
    if (!report) return;
    setReport({
      ...report,
      status: resolution,
      resolvedAt: new Date().toISOString(),
      resolutionNote:
        resolution === 'RESOLVED'
          ? 'Content taken down and issuer notified.'
          : 'Reviewed by moderator and determined not to violate community guidelines.',
    });
    setConfirmResolution(null);
    setNotice(`Report marked as ${resolution.toLowerCase()}.`);
  };

  if (!report) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link
          href={`${basePath}/reports`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Reports Queue
        </Link>
        <PageHeader
          eyebrow={`REPORT ID #${report.id.toUpperCase()}`}
          title={`Incident Report: ${report.targetTitle}`}
          badge={<StatusBadge status={report.status} />}
          actions={
            report.status === 'OPEN' ? (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setConfirmResolution('RESOLVED')}
                >
                  <CheckCircle2 size={14} /> Take Action & Resolve
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setConfirmResolution('DISMISSED')}
                >
                  <XCircle size={14} /> Dismiss Report
                </Button>
              </div>
            ) : undefined
          }
        />
      </div>

      {notice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Violation Claim & Details
            </h3>
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg text-sm font-medium text-rose-950 leading-relaxed">
              &quot;{report.reason}&quot;
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-semibold text-slate-700 mb-2">Target Resource Under Review</h4>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Type: {report.type}
                  </span>
                  <p className="text-sm font-semibold text-slate-900 m-0">{report.targetTitle}</p>
                </div>
                <Button size="sm" variant="secondary" asChild>
                  <Link href={`${basePath}/jobs`}>
                    <ExternalLink size={14} /> Inspect Target
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {report.status !== 'OPEN' ? (
            <div className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2 text-xs">
              <strong className="text-emerald-950 font-bold block text-sm">Resolution Decision</strong>
              <p className="text-emerald-800 m-0">{report.resolutionNote}</p>
              {report.resolvedAt ? (
                <span className="text-[11px] text-emerald-700 block">
                  Logged at: {new Date(report.resolvedAt).toLocaleString()}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Reporter Metadata</h4>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Reporter</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <User size={13} className="text-slate-400" /> {report.reportedBy} ({report.reportedByRole})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Submission Details</span>
                <span className="text-slate-700 text-xs mt-0.5 block">{report.details}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Submitted</span>
                <span className="text-slate-700 flex items-center gap-1.5 mt-0.5">
                  <Clock size={13} className="text-slate-400" /> {new Date(report.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(confirmResolution)}
        onClose={() => setConfirmResolution(null)}
        title={confirmResolution === 'RESOLVED' ? 'Confirm Action on Violating Content' : 'Dismiss Incident Report'}
        description={
          confirmResolution === 'RESOLVED'
            ? 'Are you sure you want to resolve this report and take down the violating content?'
            : 'Are you sure you want to dismiss this incident report as non-violating?'
        }
        confirmLabel={confirmResolution === 'RESOLVED' ? 'Sanction & Resolve' : 'Dismiss Report'}
        variant={confirmResolution === 'RESOLVED' ? 'destructive' : 'primary'}
        onConfirm={() => confirmResolution && handleResolve(confirmResolution)}
      />
    </div>
  );
}
