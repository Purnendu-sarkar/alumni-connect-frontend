'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle2,
  Compass,
  FileText,
  GraduationCap,
  Mail,
  MessageSquare,
  Sparkles,
  Users,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { demoMentorships, type MentorshipRecord } from '@/features/shared/demo-data';
import type { UserRole } from '@/types/domain';

interface MenteesViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function MenteesView({ currentRole, basePath }: MenteesViewProps) {
  const [mentees, setMentees] = useState<MentorshipRecord[]>(
    demoMentorships.filter((m) => m.status === 'ACTIVE')
  );

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`${basePath}/mentorship`}
        backLabel="Back to Mentorship Desk"
        eyebrow="TALENT NURTURING"
        title="Active Student Mentees"
        description="Track session milestones, log meeting action items, and support your enrolled campus mentees."
        actions={
          <Button asChild size="sm">
            <Link href={`${basePath}/mentorship/requests`}>Review Inquiries</Link>
          </Button>
        }
      />

      {mentees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No active mentees currently"
          description="When you accept student mentorship requests, your mentees will be organized here."
          action={
            <Button size="sm" asChild>
              <Link href={`${basePath}/mentorship/requests`}>Check Pending Requests</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mentees.map((mentee) => (
            <div
              key={mentee.id}
              className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={mentee.menteeName} />
                    <div>
                      <h3 className="text-base font-bold text-slate-900 m-0">{mentee.menteeName}</h3>
                      <p className="text-xs text-slate-500 m-0 mt-0.5">
                        {mentee.menteeDepartment} · Batch {mentee.menteeBatch}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status="ACTIVE" />
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-2 mb-3">
                  <p className="m-0 text-slate-700">
                    <strong>Focus:</strong> {mentee.topic}
                  </p>
                  {mentee.meetingSchedule ? (
                    <p className="m-0 text-blue-700 flex items-center gap-1.5 font-medium">
                      <Calendar size={13} /> {mentee.meetingSchedule}
                    </p>
                  ) : null}
                </div>

                {mentee.notes ? (
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    <strong>Meeting Notes:</strong> {mentee.notes}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <Button size="sm" variant="secondary" className="flex-1" asChild>
                  <Link href={`${basePath}/messages?user=${mentee.menteeId}`}>
                    <MessageSquare size={13} /> Message Mentee
                  </Link>
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`${basePath}/mentorship/${mentee.id}`}>
                    Workspace
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
