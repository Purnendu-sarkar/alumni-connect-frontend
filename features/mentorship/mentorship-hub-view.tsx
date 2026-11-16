'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  GraduationCap,
  HelpCircle,
  MessageSquare,
  Plus,
  Sliders,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  Users,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { CardGridSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { searchDirectory, type DirectoryMemberCard } from '@/lib/api/directory.api';
import {
  getMyMentorships,
  updateMentorshipAvailability,
  type MentorshipItem,
} from '@/lib/api/mentorship.api';
import { getApiErrorMessage } from '@/lib/api/error-utils';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface MentorshipHubViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function MentorshipHubView({ currentRole, basePath }: MentorshipHubViewProps) {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Active Sessions Query
  const {
    data: activeSessions = [],
    isLoading: isActiveLoading,
    isError: isActiveError,
  } = useQuery({
    queryKey: ['mentorship', 'active'],
    queryFn: async () => {
      const res = await getMyMentorships(accessToken, { group: 'active' });
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to load active mentorships');
      }
      return res.data;
    },
    enabled: Boolean(accessToken),
  });

  // Requests Query (for count badge)
  const { data: requestSessions = [], isLoading: isRequestsLoading } = useQuery({
    queryKey: ['mentorship', 'requests'],
    queryFn: async () => {
      const res = await getMyMentorships(accessToken, { group: 'requests' });
      if (!res.success || !res.data) {
        return [];
      }
      return res.data;
    },
    enabled: Boolean(accessToken),
  });

  // Recommended Mentors Query (for students)
  const { data: recommendedMentorsData, isLoading: isMentorsLoading } = useQuery<DirectoryMemberCard[]>({
    queryKey: ['directory', 'recommended-mentors'],
    queryFn: async () => {
      const res = await searchDirectory(accessToken, {
        mentorship: 'OPEN',
        limit: 3,
        group: 'alumni',
      });
      if (!res.success || !res.data) return [];
      return res.data;
    },
    enabled: Boolean(accessToken && currentRole === 'STUDENT'),
  });

  // Availability Toggle Mutation (for Alumni)
  const availabilityMutation = useMutation({
    mutationFn: async (targetStatus: 'OPEN' | 'CLOSED') => {
      const res = await updateMentorshipAvailability(accessToken, {
        status: targetStatus,
      });
      if (!res.success) {
        throw new Error(res.message || 'Failed to update availability');
      }
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['directory'] });
      setNotice({
        type: 'success',
        message:
          data?.mentorshipStatus === 'OPEN'
            ? 'Your mentorship status is now OPEN. Students can request guidance sessions.'
            : 'Your mentorship status is now CLOSED. Existing active partnerships remain unaffected.',
      });
      setTimeout(() => setNotice(null), 5000);
    },
    onError: (err: unknown) => {
      setNotice({
        type: 'error',
        message: getApiErrorMessage(err, 'Failed to update mentorship status.'),
      });
      setTimeout(() => setNotice(null), 5000);
    },
  });

  // Determine current alumni availability
  const isAlumniAvailable =
    user?.isMentorshipAvailable ?? (user?.role === 'ALUMNI' && !availabilityMutation.data ? true : availabilityMutation.data?.mentorshipStatus === 'OPEN');

  const handleToggleAvailability = () => {
    const nextStatus = isAlumniAvailable ? 'CLOSED' : 'OPEN';
    availabilityMutation.mutate(nextStatus);
  };

  const pendingRequestsCount = requestSessions.length;
  const activeCount = activeSessions.length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="ACADEMIC & CAREER GUIDANCE"
        title="Institutional Mentorship Desk"
        description="Connect with seasoned graduates for 1-on-1 career navigation, technical code reviews, and industry insights."
        actions={
          <div className="flex items-center gap-2">
            {currentRole === 'STUDENT' ? (
              <>
                <Button asChild variant="secondary" size="sm">
                  <Link href={`${basePath}/mentorship/requests`}>
                    My Requests {pendingRequestsCount > 0 ? `(${pendingRequestsCount})` : ''}
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`${basePath}/directory?mentorship=OPEN`}>
                    <Compass size={14} /> Find a Mentor
                  </Link>
                </Button>
              </>
            ) : currentRole === 'ALUMNI' ? (
              <>
                <Button asChild variant="secondary" size="sm">
                  <Link href={`${basePath}/mentorship/requests`}>
                    Pending Inquiries ({pendingRequestsCount})
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`${basePath}/mentorship/mentees`}>
                    Active Mentees ({activeCount})
                  </Link>
                </Button>
              </>
            ) : null}
          </div>
        }
      />

      {notice ? (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 animate-in fade-in ${
            notice.type === 'success'
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
          )}
          <span>{notice.message}</span>
        </div>
      ) : null}

      {/* Alumni Availability Card */}
      {currentRole === 'ALUMNI' ? (
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Mentorship Availability
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                  isAlumniAvailable
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {isAlumniAvailable ? 'OPEN FOR MENTEES' : 'PAUSED / CLOSED'}
              </span>
            </div>
            <p className="text-xs text-slate-600 m-0 leading-relaxed max-w-xl">
              When open, enrolled students in your discipline can discover your profile and propose guided mentorship discussions. Active capacity: {activeCount} / 5 mentees.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              disabled={availabilityMutation.isPending}
              onClick={handleToggleAvailability}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isAlumniAvailable
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
              } ${availabilityMutation.isPending ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isAlumniAvailable ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              <span>{isAlumniAvailable ? 'Accepting Requests' : 'Not Accepting'}</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Active Mentorship Sessions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 m-0">Active Mentorship Partnerships</h2>
            <p className="text-xs text-slate-500 m-0">
              Ongoing guided sessions with scheduled meeting milestones and workspace notes.
            </p>
          </div>
        </div>

        {isActiveLoading ? (
          <CardGridSkeleton count={2} />
        ) : isActiveError ? (
          <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
            Failed to load active mentorship partnerships.
          </div>
        ) : activeSessions.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No active mentorship sessions currently"
            description={
              currentRole === 'STUDENT'
                ? 'Reach out to accredited alumni in your department to initiate structured mentorship.'
                : 'Review incoming requests to accept a promising student mentee into your cohort.'
            }
            action={
              <Button size="sm" asChild>
                <Link
                  href={
                    currentRole === 'STUDENT'
                      ? `${basePath}/directory?mentorship=OPEN`
                      : `${basePath}/mentorship/requests`
                  }
                >
                  {currentRole === 'STUDENT' ? 'Browse Alumni Mentors' : 'Review Inquiries'}
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSessions.map((session) => {
              const partner = currentRole === 'STUDENT' ? session.mentor : session.mentee;
              const partnerName = partner?.name || 'Verified Member';
              const partnerPosition =
                currentRole === 'STUDENT'
                  ? `${partner?.position || 'Professional'} at ${partner?.currentCompany || 'Industry'}`
                  : `${partner?.department || 'Department'} ${partner?.batch ? `(Batch ${partner.batch})` : ''}`;

              return (
                <div
                  key={session.id}
                  className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600 font-mono">
                          {session.topic}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 m-0 mt-0.5">
                          {partnerName}
                        </h3>
                        <p className="text-xs text-slate-500 m-0 mt-0.5">{partnerPosition}</p>
                      </div>
                      <StatusBadge status={session.status} />
                    </div>

                    {session.scheduledAt ? (
                      <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-center gap-2">
                        <Calendar size={14} className="text-blue-600 shrink-0" />
                        <span>Scheduled: {session.scheduledAt}</span>
                      </div>
                    ) : null}

                    {session.message ? (
                      <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 italic">
                        &quot;{session.message}&quot;
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <Button size="sm" variant="secondary" className="flex-1" asChild>
                      <Link href={`${basePath}/messages?user=${partner?.id}`}>
                        <MessageSquare size={13} /> Message
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`${basePath}/mentorship/${session.id}`}>Workspace</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Suggested Mentors (for Students) */}
      {currentRole === 'STUDENT' ? (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 m-0">
                Recommended Departmental Mentors
              </h2>
              <p className="text-xs text-slate-500 m-0">
                Verified graduates currently open to counseling junior students.
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`${basePath}/directory?mentorship=OPEN`}>View All Mentors →</Link>
            </Button>
          </div>

          {isMentorsLoading ? (
            <CardGridSkeleton count={3} />
          ) : recommendedMentorsData && recommendedMentorsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedMentorsData.map((mentor: DirectoryMemberCard) => (
                <div
                  key={mentor.id}
                  className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar name={mentor.name} src={mentor.avatarUrl} />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 m-0">{mentor.name}</h4>
                        <p className="text-xs text-slate-500 m-0">
                          {mentor.position || 'Alumni Member'}
                        </p>
                        {mentor.currentCompany ? (
                          <p className="text-xs font-semibold text-slate-700 m-0">
                            {mentor.currentCompany}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    {mentor.bio ? (
                      <p className="text-xs text-slate-600 line-clamp-2 mb-3">{mentor.bio}</p>
                    ) : null}
                  </div>

                  <Button size="sm" asChild>
                    <Link href={`${basePath}/directory/${mentor.id}`}>
                      <Compass size={13} /> View Mentor Profile
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              No recommended mentors available at this moment.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}