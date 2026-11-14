'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  GraduationCap,
  Handshake,
  Inbox,
  Megaphone,
  PenSquare,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  UserRound,
  Users,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { getMyJobs } from '@/lib/api/jobs.api';
import { getMe, getMyConnections, updateMe } from '@/lib/api/user.api';
import { useAuthStore } from '@/store/auth-store';

export default function AlumniDashboardPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const updateUser = useAuthStore((state) => state.updateUser);
  const firstName = user?.name ? user.name.split(' ')[0] : 'Alumnus';

  const [mentorshipOpen, setMentorshipOpen] = useState(false);
  const [toggleNotice, setToggleNotice] = useState<string | null>(null);

  // Real API queries
  const profileQuery = useQuery({
    queryKey: ['my-profile', accessToken],
    queryFn: () => getMe(accessToken),
    enabled: Boolean(accessToken),
  });

  const jobsQuery = useQuery({
    queryKey: ['my-jobs', accessToken],
    queryFn: () => getMyJobs(accessToken),
    enabled: Boolean(accessToken),
  });

  const connectionsQuery = useQuery({
    queryKey: ['my-connections', accessToken],
    queryFn: () => getMyConnections(accessToken),
    enabled: Boolean(accessToken),
  });

  const profile = profileQuery.data?.data;
  const postedJobs = jobsQuery.data?.data?.postedJobs ?? [];
  const connections = connectionsQuery.data?.data ?? [];
  const activeConnections = connections.filter((c) => c.status === 'ACCEPTED');
  const pendingConnections = connections.filter((c) => c.status === 'PENDING');

  // Sync mentorship status from backend DB profile
  useEffect(() => {
    if (profile?.isMentorshipAvailable !== undefined) {
      setMentorshipOpen(Boolean(profile.isMentorshipAvailable));
    }
  }, [profile?.isMentorshipAvailable]);

  // Database-backed Mentorship Availability Mutation
  const toggleMutation = useMutation({
    mutationFn: (newStatus: boolean) =>
      updateMe(accessToken, { isMentorshipAvailable: newStatus } as any),
    onMutate: async (newStatus: boolean) => {
      setMentorshipOpen(newStatus);
    },
    onSuccess: (res, newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      updateUser({ isMentorshipAvailable: newStatus } as any);
      setToggleNotice(
        newStatus
          ? 'Your mentorship availability is saved as OPEN. Undergrad students can request guidance.'
          : 'Your mentorship availability is saved as PAUSED in institutional records.'
      );
      setTimeout(() => setToggleNotice(null), 4000);
    },
    onError: (_err, _newStatus) => {
      // Revert on failure
      setMentorshipOpen(!_newStatus);
      setToggleNotice('Failed to update mentorship status. Please try again.');
      setTimeout(() => setToggleNotice(null), 4000);
    },
  });

  const handleToggleMentorship = () => {
    if (toggleMutation.isPending) return;
    const nextState = !mentorshipOpen;
    toggleMutation.mutate(nextState);
  };

  const completionPercentage = profile?.completionPercentage ?? (user?.onboardingCompleted ? 100 : 70);
  const missingFields = (profile as any)?.missingRequiredFields ?? [];
  const isOnboardingIncomplete = !user?.onboardingCompleted && completionPercentage < 100;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={user?.university?.name ? user.university.name.toUpperCase() : 'ALUMNI PROFESSIONAL DESK'}
        title={`Welcome back, ${firstName}.`}
        description={`Accredited Alumni Member · ${user?.department || 'Alumni Network'} · Class of ${user?.batch || '2020'}`}
        badge={<StatusBadge status={user?.verificationStatus || 'APPROVED'} label={user?.verificationStatus === 'APPROVED' ? 'Accredited Alumnus' : 'Accreditation Pending'} />}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild size="sm">
              <Link href="/alumni/jobs/create">
                <Plus size={14} /> Post Career Opening
              </Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href="/alumni/stories/create">
                <PenSquare size={14} /> Write Story
              </Link>
            </Button>
          </div>
        }
      />

      {/* Onboarding Guidance Banner */}
      {isOnboardingIncomplete ? (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 m-0">
                Complete Your Alumni Profile ({completionPercentage}% completed)
              </p>
              <p className="text-slate-600 m-0 mt-0.5">
                {missingFields.length > 0
                  ? `Please complete your ${missingFields.join(', ')} to enhance campus directory discoverability.`
                  : 'Add your current company, role, LinkedIn, and bio to help students connect for mentorship.'}
              </p>
            </div>
          </div>
          <Button size="sm" asChild className="shrink-0">
            <Link href="/alumni/profile/edit">Complete Profile Now</Link>
          </Button>
        </div>
      ) : null}

      {toggleNotice ? (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
          <span>{toggleNotice}</span>
        </div>
      ) : null}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Jobs Posted"
          value={postedJobs.length}
          icon={BriefcaseBusiness}
          iconColor="#16A34A"
          subtext={`${postedJobs.filter((j) => j.status === 'APPROVED').length} active on campus board`}
          href="/alumni/jobs/my-jobs"
          actionLabel="Manage Jobs"
        />
        <StatCard
          label="Mentorship Desk"
          value={mentorshipOpen ? 'Open' : 'Paused'}
          icon={Compass}
          iconColor="#2563EB"
          subtext={mentorshipOpen ? 'Accepting mentees' : 'Mentorship paused'}
          href="/alumni/mentorship"
          actionLabel="Mentorship Desk"
        />
        <StatCard
          label="Network Connections"
          value={activeConnections.length}
          icon={Handshake}
          iconColor="#7C3AED"
          subtext={`${pendingConnections.length} pending requests`}
          href="/alumni/connections"
          actionLabel="View Network"
        />
        <StatCard
          label="Profile Completion"
          value={`${completionPercentage}%`}
          icon={UserRound}
          iconColor="#D97706"
          subtext={completionPercentage < 100 ? 'Add company & bio' : 'All credentials verified'}
          href="/alumni/profile/edit"
          actionLabel="Edit Profile"
        />
      </div>

      {/* Mentorship Availability Quick Card */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Mentorship Availability Status
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                mentorshipOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {mentorshipOpen ? 'OPEN FOR STUDENTS' : 'PAUSED'}
            </span>
          </div>
          <p className="text-xs text-slate-600 m-0 leading-relaxed max-w-xl">
            Allow current undergrads in your department to discover your professional background and request 1-on-1 resume reviews and career guidance.
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleMentorship}
          disabled={toggleMutation.isPending}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 ${
            mentorshipOpen ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
          }`}
        >
          {mentorshipOpen ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          <span>{toggleMutation.isPending ? 'Saving…' : (mentorshipOpen ? 'Accepting Mentees' : 'Paused')}</span>
        </button>
      </div>

      {/* Quick Launchpad */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 m-0">
          Alumni Desk Quick Actions
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <Button asChild size="sm" variant="secondary">
            <Link href="/alumni/jobs/create">
              <Plus size={14} /> Post a Job
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href="/alumni/jobs/my-jobs">
              <BriefcaseBusiness size={14} /> Manage My Jobs
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href="/alumni/applications/received">
              <FileCheck2 size={14} /> Review Applicants
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href="/alumni/mentorship">
              <Compass size={14} /> Manage Mentorship
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href="/alumni/connections">
              <Handshake size={14} /> View Connections
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href="/alumni/stories/create">
              <PenSquare size={14} /> Write a Story
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/alumni/settings/privacy">
              Update Availability
            </Link>
          </Button>
        </div>
      </div>

      {/* 2-Column Split: Active Mentees / Recruitment Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Postings & Applicants */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 m-0">Recent Postings & Recruitment</h2>
              <p className="text-xs text-slate-500 m-0">Manage job applicants and opportunities you posted.</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/alumni/jobs/my-jobs">View all jobs →</Link>
            </Button>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            {postedJobs.length > 0 ? (
              postedJobs.slice(0, 3).map((job) => (
                <div key={job.id} className="flex items-center justify-between pb-3 border-b border-slate-100 last:border-b-0 last:pb-0">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 m-0">{job.title}</h4>
                    <p className="text-xs text-slate-500 m-0">{job.company} · {job.location || 'Remote'}</p>
                  </div>
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={`/alumni/jobs/${job.id}`}>Manage</Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-6 text-center space-y-2">
                <BriefcaseBusiness size={24} className="mx-auto text-slate-300" />
                <p className="text-xs font-semibold text-slate-700 m-0">No job openings posted yet</p>
                <p className="text-[11px] text-slate-400 m-0">Share openings from your company with university students.</p>
                <Button size="sm" asChild className="mt-2">
                  <Link href="/alumni/jobs/create">Post First Job</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Campus Events & Notices */}
        <div className="space-y-6">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 m-0">
                Alumni Gatherings
              </h3>
              <Link href="/alumni/events" className="text-[11px] font-semibold text-blue-600 hover:underline">
                All Events →
              </Link>
            </div>

            <div className="p-6 bg-slate-50 rounded-lg text-center space-y-1.5">
              <Calendar size={22} className="mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-700 m-0">No upcoming events</p>
              <p className="text-[11px] text-slate-400 m-0">Alumni reunions and webinars will be listed here.</p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 m-0">
                Campus Notices
              </h3>
              <Link href="/alumni/announcements" className="text-[11px] font-semibold text-blue-600 hover:underline">
                Notices →
              </Link>
            </div>

            <div className="p-6 bg-slate-50 rounded-lg text-center space-y-1.5">
              <Megaphone size={22} className="mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-700 m-0">No active notices</p>
              <p className="text-[11px] text-slate-400 m-0">Official university bulletins will be shown here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
