'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  MessageSquare,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { demoMentorships, type MentorshipRecord } from '@/features/shared/demo-data';
import type { UserRole } from '@/types/domain';

interface MentorshipRequestsViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function MentorshipRequestsView({ currentRole, basePath }: MentorshipRequestsViewProps) {
  const [requests, setRequests] = useState<MentorshipRecord[]>(demoMentorships);
  const [notice, setNotice] = useState<string | null>(null);

  const handleAction = (id: string, newStatus: 'ACTIVE' | 'REJECTED') => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    setNotice(
      newStatus === 'ACTIVE'
        ? 'Mentorship request accepted! A collaborative workspace has been initialized.'
        : 'Mentorship request declined.'
    );
    setTimeout(() => setNotice(null), 4000);
  };

  const pendingRequests = requests.filter((r) => r.status === 'REQUESTED');

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`${basePath}/mentorship`}
        backLabel="Back to Mentorship Hub"
        eyebrow="INQUIRY PIPELINE"
        title="Mentorship Requests"
        description="Review incoming proposals, clarify learning objectives, or confirm 1-on-1 coaching agreements."
      />

      {notice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      ) : null}

      {pendingRequests.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="All mentorship requests have been reviewed"
          description="There are no pending student mentorship inquiries in your queue."
          action={
            <Button size="sm" asChild>
              <Link href={`${basePath}/mentorship`}>Return to Mentorship Hub</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((req) => (
            <div
              key={req.id}
              className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Avatar name={currentRole === 'STUDENT' ? req.mentorName : req.menteeName} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 m-0">
                        {currentRole === 'STUDENT' ? `Mentor: ${req.mentorName}` : req.menteeName}
                      </h3>
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="text-xs text-slate-500 m-0 mt-0.5">
                      {currentRole === 'STUDENT'
                        ? `${req.mentorPosition} at ${req.mentorCompany}`
                        : `${req.menteeDepartment} (Batch ${req.menteeBatch})`}
                    </p>
                  </div>
                </div>

                {currentRole === 'ALUMNI' ? (
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleAction(req.id, 'ACTIVE')}
                    >
                      <Check size={14} /> Accept Mentee
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAction(req.id, 'REJECTED')}
                      className="text-rose-600 hover:bg-rose-50"
                    >
                      <X size={14} /> Decline
                    </Button>
                  </div>
                ) : null}
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Proposed Topic</p>
                <p className="text-sm font-bold text-slate-900 m-0 mt-0.5">{req.topic}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg text-xs leading-relaxed text-slate-700">
                <strong className="block text-slate-900 mb-1">Inquiry Message:</strong>
                &quot;{req.message}&quot;
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`${basePath}/messages?user=${currentRole === 'STUDENT' ? req.mentorId : req.menteeId}`}>
                    <MessageSquare size={13} /> Chat to Clarify
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
