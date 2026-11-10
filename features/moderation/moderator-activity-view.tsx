'use client';

import { CheckCircle2, Clock, FileCheck2, Shield, UserX, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import type { UserRole } from '@/types/domain';

interface ModeratorActivityViewProps {
  currentRole: UserRole;
  basePath: string;
}

const SAMPLE_LOGS = [
  {
    id: 'act-1',
    action: 'JOB_APPROVED',
    target: 'Software Engineer, Platform Core at bKash',
    time: '2 hours ago',
    details: 'Verified employer legitimacy and salary terms. Approved for campus release.',
  },
  {
    id: 'act-2',
    action: 'REPORT_RESOLVED',
    target: 'Suspicious Job / Possible Advance Fee Scam',
    time: '4 hours ago',
    details: 'Unpublished job and warned poster for fee-solicitation breach.',
  },
  {
    id: 'act-3',
    action: 'STORY_PUBLISHED',
    target: 'Designing with Purpose by Nafisa Chowdhury',
    time: 'Yesterday',
    details: 'Editorial approval granted. Highlighted on platform feed.',
  },
  {
    id: 'act-4',
    action: 'JOB_REJECTED',
    target: 'Unverified Work from Home Clerk',
    time: 'Nov 6, 2026',
    details: 'Broken referral URL and missing company contact information.',
  },
];

export function ModeratorActivityView({ currentRole, basePath }: ModeratorActivityViewProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AUDIT TRAIL"
        title="Moderation Activity Logs"
        description="Immutable audit trail of review decisions, content approvals, and resolution actions executed on this desk."
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {SAMPLE_LOGS.map((log) => (
          <div key={log.id} className="p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-full bg-slate-100 text-slate-700 shrink-0 mt-0.5">
              {log.action.includes('APPROVED') || log.action.includes('PUBLISHED') ? (
                <CheckCircle2 size={18} className="text-emerald-600" />
              ) : log.action.includes('REJECTED') ? (
                <XCircle size={18} className="text-rose-600" />
              ) : (
                <Shield size={18} className="text-blue-600" />
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold font-mono tracking-wider text-slate-800">
                  {log.action}
                </span>
                <span className="text-[10px] text-slate-400">{log.time}</span>
              </div>

              <p className="text-xs font-bold text-slate-900 m-0">{log.target}</p>
              <p className="text-xs text-slate-600 m-0 leading-relaxed">{log.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
