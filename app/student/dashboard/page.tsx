'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  GraduationCap,
  Handshake,
  Inbox,
  Megaphone,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  UserCheck,
  UserRound,
  Users,
  XCircle,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import {
  demoAnnouncements,
  demoEvents,
  demoJobs,
  demoMentorships,
  demoNotifications,
} from '@/features/shared/demo-data';
import { getMyJobs } from '@/lib/api/jobs.api';
import { getMe } from '@/lib/api/user.api';
import { useAuthStore } from '@/store/auth-store';

export default function StudentDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';

  // Real API queries
  const jobsQuery = useQuery({
    queryKey: ['my-jobs', accessToken],
    queryFn: () => getMyJobs(accessToken),
    enabled: Boolean(accessToken),
  });

  const profileQuery = useQuery({
    queryKey: ['my-profile', accessToken],
    queryFn: () => getMe(accessToken),
    enabled: Boolean(accessToken),
  });

  const applications = jobsQuery.data?.data?.applications ?? [];
  const profile = profileQuery.data?.data;

  // Profile completion calculation
  const completionPercentage = profile?.completionPercentage || (user?.verificationStatus === 'APPROVED' ? 85 : 60);

  const activeMentorships = demoMentorships.filter((m) => m.status === 'ACTIVE');
  const pendingMentorships = demoMentorships.filter((m) => m.status === 'REQUESTED');
  const upcomingEvents = demoEvents.slice(0, 2);
  const recentNotices = demoAnnouncements.slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        eyebrow={user?.university?.name ? user.university.name.toUpperCase() : 'STUDENT DESK'}
        title={`Welcome back, ${firstName}.`}
        description={`Enrolled Student Member · ${user?.department || 'Computer Science & Engineering'} · Batch ${user?.batch || '2022'}`}
        badge={<StatusBadge status={user?.verificationStatus || 'APPROVED'} label={user?.verificationStatus === 'APPROVED' ? 'Verified Student' : 'Verification Pending'} />}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="secondary">
              <Link href="/student/directory">
                <Search size={14} /> Find Alumni
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/student/jobs">
                <BriefcaseBusiness size={14} /> Explore Jobs
              </Link>
            </Button>
          </div>
        }
      />

      {/* Verification Notice Banner if not approved */}
      {user?.verificationStatus !== 'APPROVED' ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Clock size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 m-0">Academic Verification in Progress</p>
              <p className="text-slate-600 m-0 mt-0.5">
                Your student ID and departmental records are currently being verified by the university moderator. Complete directory messaging unlocks upon approval.
              </p>
            </div>
          </div>
          <Button size="sm" variant="secondary" asChild className="shrink-0">
            <Link href="/student/profile/edit">Update Academic Details</Link>
          </Button>
        </div>
      ) : null}

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Profile Completion"
          value={`${completionPercentage}%`}
          icon={UserRound}
          iconColor="#2563EB"
          subtext={completionPercentage < 100 ? 'Add bio, resume & skills' : 'All credentials verified'}
          href="/student/profile/edit"
          actionLabel="Complete Profile"
        />
        <StatCard
          label="Active Connections"
          value={3}
          icon={Handshake}
          iconColor="#16A34A"
          subtext="2 pending requests"
          href="/student/connections"
          actionLabel="View Connections"
        />
        <StatCard
          label="Mentorship Status"
          value={activeMentorships.length > 0 ? `${activeMentorships.length} Active` : 'No Mentors'}
          icon={Compass}
          iconColor="#7C3AED"
          subtext={`${pendingMentorships.length} requests in review`}
          href="/student/mentorship"
          actionLabel="Mentorship Hub"
        />
        <StatCard
          label="Job Applications"
          value={applications.length}
          icon={BriefcaseBusiness}
          iconColor="#0284C7"
          subtext="Track hiring progress"
          href="/student/applications"
          actionLabel="View Applications"
        />
      </div>

      {/* Quick Actions Action Bar */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 m-0">
          Quick Launchpad
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <Button asChild size="sm" variant="secondary">
            <Link href="/student/directory">
              <Users size={14} /> Find Alumni
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href="/student/jobs">
              <BriefcaseBusiness size={14} /> Explore Jobs
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href="/student/mentorship">
              <Compass size={14} /> Request Mentorship
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href="/student/events">
              <Calendar size={14} /> Browse Events
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href="/student/applications">
              <FileCheck2 size={14} /> View Applications
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/student/profile/edit">
              <UserRound size={14} /> Complete Profile
            </Link>
          </Button>
        </div>
      </div>

      {/* 2-Column Split: Recommended Jobs + Mentorship / Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recommended Jobs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 m-0">Recommended Career Openings</h2>
              <p className="text-xs text-slate-500 m-0">Opportunities posted directly by alumni in your field.</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/student/jobs">View all jobs →</Link>
            </Button>
          </div>

          <div className="space-y-3">
            {demoJobs.slice(0, 3).map((job) => (
              <div
                key={job.id}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-slate-900 m-0">{job.title}</h3>
                    <Badge variant="neutral">{job.employmentType || 'Full-time'}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 m-0">
                    <strong>{job.company}</strong> · {job.location || 'Remote'}
                  </p>
                  <p className="text-[11px] text-slate-400 m-0 mt-1">
                    Shared by {job.postedBy?.name} · Closes {new Date(job.expiresAt || '').toLocaleDateString()}
                  </p>
                </div>

                <Button size="sm" asChild className="shrink-0 self-end sm:self-center">
                  <Link href={`/student/jobs/${job.id}`}>Apply Now</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Upcoming Events & Notices */}
        <div className="space-y-6">
          {/* Upcoming Registered Events */}
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 m-0">
                Upcoming Events
              </h3>
              <Link href="/student/events" className="text-[11px] font-semibold text-blue-600 hover:underline">
                Calendar →
              </Link>
            </div>

            <div className="space-y-2.5">
              {upcomingEvents.map((ev) => (
                <div key={ev.id} className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate">{ev.title}</span>
                    <span className="text-[10px] text-blue-700 font-bold px-1.5 py-0.2 bg-blue-100 rounded">
                      {ev.day} {ev.month}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 m-0">{ev.location}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Department Notices */}
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 m-0">
                Recent Announcements
              </h3>
              <Link href="/student/announcements" className="text-[11px] font-semibold text-blue-600 hover:underline">
                All Notices →
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentNotices.map((ann) => (
                <div key={ann.id} className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                  <p className="font-bold text-slate-900 m-0 truncate">{ann.title}</p>
                  <p className="text-[11px] text-slate-500 m-0">{ann.date} · {ann.author}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
