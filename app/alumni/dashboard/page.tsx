'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
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
import {
  demoAnnouncements,
  demoEvents,
  demoJobs,
  demoMentorships,
  demoStories,
} from '@/features/shared/demo-data';
import { getMyJobs } from '@/lib/api/jobs.api';
import { useAuthStore } from '@/store/auth-store';

export default function AlumniDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const firstName = user?.name ? user.name.split(' ')[0] : 'Alumnus';

  const [mentorshipOpen, setMentorshipOpen] = useState(true);
  const [toggleNotice, setToggleNotice] = useState<string | null>(null);

  // Real API queries
  const jobsQuery = useQuery({
    queryKey: ['my-jobs', accessToken],
    queryFn: () => getMyJobs(accessToken),
    enabled: Boolean(accessToken),
  });

  const postedJobs = jobsQuery.data?.data?.postedJobs ?? [];
  const activeMentees = demoMentorships.filter((m) => m.status === 'ACTIVE');
  const pendingMentorships = demoMentorships.filter((m) => m.status === 'REQUESTED');
  const publishedStories = demoStories.filter((s) => s.status === 'PUBLISHED');

  const handleToggleMentorship = () => {
    setMentorshipOpen(!mentorshipOpen);
    setToggleNotice(
      !mentorshipOpen
        ? 'Your mentorship status is now OPEN. Students can request sessions with you.'
        : 'Your mentorship status is now PAUSED.'
    );
    setTimeout(() => setToggleNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={user?.university?.name ? user.university.name.toUpperCase() : 'ALUMNI PROFESSIONAL DESK'}
        title={`Welcome back, ${firstName}.`}
        description={`Accredited Alumni Member · ${user?.department || 'Alumni Network'} · Class of ${user?.batch || '2016'}`}
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
          label="Active Mentees"
          value={activeMentees.length}
          icon={Compass}
          iconColor="#2563EB"
          subtext={`${pendingMentorships.length} incoming requests`}
          href="/alumni/mentorship"
          actionLabel="Mentorship Desk"
        />
        <StatCard
          label="Network Connections"
          value={3}
          icon={Handshake}
          iconColor="#7C3AED"
          subtext="2 pending requests"
          href="/alumni/connections"
          actionLabel="View Network"
        />
        <StatCard
          label="Published Stories"
          value={publishedStories.length}
          icon={Sparkles}
          iconColor="#D97706"
          subtext="Career insights shared"
          href="/alumni/stories/my-stories"
          actionLabel="My Stories"
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
            Allow current undergrads in your department to discover your background and request 1-on-1 resume reviews and career guidance.
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleMentorship}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 ${
            mentorshipOpen ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
          }`}
        >
          {mentorshipOpen ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          <span>{mentorshipOpen ? 'Accepting Mentees' : 'Paused'}</span>
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
              <h2 className="text-base font-bold text-slate-900 m-0">Recent Candidate Activity</h2>
              <p className="text-xs text-slate-500 m-0">Students who applied for your posted opportunities.</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/alumni/applications/received">Review all applicants →</Link>
            </Button>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Avatar name="Purnendu Sarkar" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 m-0">Purnendu Sarkar</h4>
                  <p className="text-xs text-slate-500 m-0">Applied for Junior Backend Engineer (Go/Node.js)</p>
                </div>
              </div>
              <Button size="sm" variant="secondary" asChild>
                <Link href="/alumni/applications/received">Review Application</Link>
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name="Farhana Yeasmin" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 m-0">Farhana Yeasmin</h4>
                  <p className="text-xs text-slate-500 m-0">Applied for Product Design Intern</p>
                </div>
              </div>
              <Button size="sm" variant="secondary" asChild>
                <Link href="/alumni/applications/received">Review Application</Link>
              </Button>
            </div>
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

            <div className="space-y-2.5">
              {demoEvents.slice(0, 2).map((ev) => (
                <div key={ev.id} className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                  <p className="font-bold text-slate-900 m-0 truncate">{ev.title}</p>
                  <p className="text-[11px] text-slate-500 m-0">{ev.date} · {ev.location}</p>
                </div>
              ))}
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

            <div className="space-y-2.5">
              {demoAnnouncements.slice(0, 2).map((ann) => (
                <div key={ann.id} className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                  <p className="font-bold text-slate-900 m-0 truncate">{ann.title}</p>
                  <p className="text-[11px] text-slate-500 m-0">{ann.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
