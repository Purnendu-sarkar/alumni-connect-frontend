'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
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
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { demoAlumni, demoMentorships, type MentorshipRecord } from '@/features/shared/demo-data';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface MentorshipHubViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function MentorshipHubView({ currentRole, basePath }: MentorshipHubViewProps) {
  const user = useAuthStore((state) => state.user);

  // Alumni availability toggle state
  const [isAvailable, setIsAvailable] = useState(true);
  const [maxMentees, setMaxMentees] = useState(3);
  const [availabilityNotice, setAvailabilityNotice] = useState<string | null>(null);

  const [mentorships, setMentorships] = useState<MentorshipRecord[]>(demoMentorships);

  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
    setAvailabilityNotice(
      !isAvailable
        ? 'Your mentorship status is now OPEN. Students can request sessions with you.'
        : 'Your mentorship status is now CLOSED. Existing sessions remain active.'
    );
    setTimeout(() => setAvailabilityNotice(null), 4000);
  };

  const activeSessions = mentorships.filter((m) => m.status === 'ACTIVE');
  const pendingSessions = mentorships.filter((m) => m.status === 'REQUESTED');

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
                  <Link href={`${basePath}/mentorship/requests`}>My Requests</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`${basePath}/directory`}>
                    <Compass size={14} /> Find a Mentor
                  </Link>
                </Button>
              </>
            ) : currentRole === 'ALUMNI' ? (
              <>
                <Button asChild variant="secondary" size="sm">
                  <Link href={`${basePath}/mentorship/requests`}>Pending Inquiries ({pendingSessions.length})</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`${basePath}/mentorship/mentees`}>Active Mentees ({activeSessions.length})</Link>
                </Button>
              </>
            ) : null}
          </div>
        }
      />

      {availabilityNotice ? (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
          <span>{availabilityNotice}</span>
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
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {isAvailable ? 'OPEN FOR MENTEES' : 'PAUSED / CLOSED'}
              </span>
            </div>
            <p className="text-xs text-slate-600 m-0 leading-relaxed max-w-xl">
              When open, enrolled students can discover your profile and propose guided mentorship discussions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleAvailability}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                isAvailable ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
              }`}
            >
              {isAvailable ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              <span>{isAvailable ? 'Accepting Requests' : 'Not Accepting'}</span>
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
              Ongoing guided sessions with scheduled meeting milestones.
            </p>
          </div>
        </div>

        {activeSessions.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No active mentorship sessions currently"
            description={
              currentRole === 'STUDENT'
                ? 'Reach out to accredited alumni in your department to initiate mentorship.'
                : 'Review incoming requests to accept a promising student mentee.'
            }
            action={
              <Button size="sm" asChild>
                <Link href={currentRole === 'STUDENT' ? `${basePath}/directory` : `${basePath}/mentorship/requests`}>
                  {currentRole === 'STUDENT' ? 'Browse Alumni Mentors' : 'Review Inquiries'}
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600">
                        {session.topic}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 m-0 mt-0.5">
                        {currentRole === 'STUDENT' ? session.mentorName : session.menteeName}
                      </h3>
                      <p className="text-xs text-slate-500 m-0 mt-0.5">
                        {currentRole === 'STUDENT'
                          ? `${session.mentorPosition} at ${session.mentorCompany}`
                          : `${session.menteeDepartment} (Batch ${session.menteeBatch})`}
                      </p>
                    </div>
                    <StatusBadge status={session.status} />
                  </div>

                  {session.meetingSchedule ? (
                    <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-blue-900 flex items-center gap-2">
                      <Calendar size={14} className="text-blue-600 shrink-0" />
                      <span>{session.meetingSchedule}</span>
                    </div>
                  ) : null}

                  {session.notes ? (
                    <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                      <strong>Latest Notes:</strong> {session.notes}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <Button size="sm" variant="secondary" className="flex-1" asChild>
                    <Link href={`${basePath}/messages?user=${currentRole === 'STUDENT' ? session.mentorId : session.menteeId}`}>
                      <MessageSquare size={13} /> Message
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`${basePath}/mentorship/${session.id}`}>
                      Workspace
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Mentors (for Students) */}
      {currentRole === 'STUDENT' ? (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900 m-0">Recommended Departmental Mentors</h2>
            <p className="text-xs text-slate-500 m-0">Verified graduates open to counseling junior students.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demoAlumni.slice(0, 3).map((alumnus) => (
              <div
                key={alumnus.id}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar name={alumnus.name} src={alumnus.avatarUrl} />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 m-0">{alumnus.name}</h4>
                      <p className="text-xs text-slate-500 m-0">{alumnus.position}</p>
                      <p className="text-xs font-semibold text-slate-700 m-0">{alumnus.currentCompany}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">{alumnus.bio}</p>
                </div>

                <Button size="sm" asChild>
                  <Link href={`${basePath}/directory/${alumnus.id}`}>
                    <Compass size={13} /> View Mentor Profile
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
