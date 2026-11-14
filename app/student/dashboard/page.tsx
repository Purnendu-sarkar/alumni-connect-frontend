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
import { getJobs, getMyJobs } from '@/lib/api/jobs.api';
import { getMe, getMyConnections } from '@/lib/api/user.api';
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

  const publicJobsQuery = useQuery({
    queryKey: ['public-jobs'],
    queryFn: () => getJobs(),
  });

  const profileQuery = useQuery({
    queryKey: ['my-profile', accessToken],
    queryFn: () => getMe(accessToken),
    enabled: Boolean(accessToken),
  });

  const connectionsQuery = useQuery({
    queryKey: ['my-connections', accessToken],
    queryFn: () => getMyConnections(accessToken),
    enabled: Boolean(accessToken),
  });

  const applications = jobsQuery.data?.data?.applications ?? [];
  const publishedJobs = publicJobsQuery.data?.data ?? [];
  const profile = profileQuery.data?.data;
  const connections = connectionsQuery.data?.data ?? [];

  const activeConnections = connections.filter((c) => c.status === 'ACCEPTED');
  const pendingConnections = connections.filter((c) => c.status === 'PENDING');

  // Dynamic server-calculated profile completion & onboarding metrics
  const completionPercentage = profile?.completionPercentage ?? (user?.onboardingCompleted ? 100 : 70);
  const missingFields = (profile as any)?.missingRequiredFields ?? [];
  const isOnboardingIncomplete = !user?.onboardingCompleted && completionPercentage < 100;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        eyebrow={user?.university?.name ? user.university.name.toUpperCase() : 'STUDENT DESK'}
        title={`Welcome back, ${firstName}.`}
        description={`Enrolled Student Member · ${user?.department || 'Computer Science & Engineering'} · Batch ${user?.batch || '2024'}`}
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

      {/* Persistent Non-Blocking Onboarding Guidance Banner */}
      {isOnboardingIncomplete ? (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 m-0">
                Complete Your Student Profile ({completionPercentage}% completed)
              </p>
              <p className="text-slate-600 m-0 mt-0.5">
                {missingFields.length > 0
                  ? `Please provide your ${missingFields.join(', ')} to boost visibility across the university network.`
                  : 'Add your biography, technical skills, resume, and profile photo to unlock mentorship and career referrals.'}
              </p>
            </div>
          </div>
          <Button size="sm" asChild className="shrink-0">
            <Link href="/student/profile/edit">Complete Profile Now</Link>
          </Button>
        </div>
      ) : null}

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
          subtext={completionPercentage < 100 ? (missingFields.length > 0 ? `Missing: ${missingFields[0]}` : 'Add bio & skills') : 'All credentials verified'}
          href="/student/profile/edit"
          actionLabel="Complete Profile"
        />
        <StatCard
          label="Active Connections"
          value={activeConnections.length}
          icon={Handshake}
          iconColor="#16A34A"
          subtext={`${pendingConnections.length} pending requests`}
          href="/student/connections"
          actionLabel="View Connections"
        />
        <StatCard
          label="Mentorship Status"
          value="Hub Ready"
          icon={Compass}
          iconColor="#7C3AED"
          subtext="Request alumni mentors"
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
              <h2 className="text-base font-bold text-slate-900 m-0">Career Openings</h2>
              <p className="text-xs text-slate-500 m-0">Opportunities posted directly by alumni in your field.</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/student/jobs">View all jobs →</Link>
            </Button>
          </div>

          <div className="space-y-3">
            {publishedJobs.length > 0 ? (
              publishedJobs.slice(0, 3).map((job) => (
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
                      {job.postedBy?.name ? `Shared by ${job.postedBy.name} · ` : ''}Closes {job.expiresAt ? new Date(job.expiresAt).toLocaleDateString() : 'Open'}
                    </p>
                  </div>

                  <Button size="sm" asChild className="shrink-0 self-end sm:self-center">
                    <Link href={`/student/jobs/${job.id}`}>Apply Now</Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="p-8 bg-white rounded-xl border border-slate-200 text-center space-y-2">
                <BriefcaseBusiness size={28} className="mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-slate-700 m-0">No active job postings at this moment</p>
                <p className="text-xs text-slate-400 m-0 max-w-sm mx-auto">
                  Alumni regularly post career openings and internship opportunities. Check back soon.
                </p>
              </div>
            )}
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

            <div className="p-6 bg-slate-50 rounded-lg text-center space-y-1.5">
              <Calendar size={22} className="mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-700 m-0">No upcoming events scheduled</p>
              <p className="text-[11px] text-slate-400 m-0">Department seminars & alumni meetups will appear here.</p>
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

            <div className="p-6 bg-slate-50 rounded-lg text-center space-y-1.5">
              <Megaphone size={22} className="mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-700 m-0">No announcements yet</p>
              <p className="text-[11px] text-slate-400 m-0">Official institutional updates will be published here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
