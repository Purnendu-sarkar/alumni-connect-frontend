'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
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
import { CardGridSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { getMyMentorships } from '@/lib/api/mentorship.api';
import { getApiErrorMessage } from '@/lib/api/error-utils';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface MenteesViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function MenteesView({ currentRole, basePath }: MenteesViewProps) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const {
    data: mentees = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['mentorship', 'active-mentees'],
    queryFn: async () => {
      const res = await getMyMentorships(accessToken, { group: 'active' });
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to fetch active mentees');
      }
      return res.data;
    },
    enabled: Boolean(accessToken),
  });

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

      {isLoading ? (
        <CardGridSkeleton count={2} />
      ) : isError ? (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
          {getApiErrorMessage(error, 'Failed to load active mentees.')}
        </div>
      ) : mentees.length === 0 ? (
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
          {mentees.map((item) => {
            const mentee = item.mentee;
            const menteeName = mentee?.name || 'Student Mentee';
            const menteeDept = mentee?.department || 'Department';
            const menteeBatch = mentee?.batch ? `Batch ${mentee.batch}` : '';

            return (
              <div
                key={item.id}
                className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={menteeName} src={mentee?.avatarUrl} />
                      <div>
                        <h3 className="text-base font-bold text-slate-900 m-0">{menteeName}</h3>
                        <p className="text-xs text-slate-500 m-0 mt-0.5">
                          {menteeDept} {menteeBatch ? `· ${menteeBatch}` : ''}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status="ACTIVE" />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-2 mb-3">
                    <p className="m-0 text-slate-800">
                      <strong>Focus Topic:</strong> {item.topic}
                    </p>
                    <p className="m-0 text-slate-600">
                      <strong>Career Goal:</strong> {item.careerGoal}
                    </p>
                    {item.scheduledAt ? (
                      <p className="m-0 text-blue-700 flex items-center gap-1.5 font-medium">
                        <Calendar size={13} /> {item.scheduledAt}
                      </p>
                    ) : null}
                  </div>

                  {item.message ? (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic">
                      &quot;{item.message}&quot;
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <Button size="sm" variant="secondary" className="flex-1" asChild>
                    <Link href={`${basePath}/messages?user=${mentee?.id || item.menteeId}`}>
                      <MessageSquare size={13} /> Message Mentee
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`${basePath}/mentorship/${item.id}`}>Workspace</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}