'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Briefcase,
  Handshake,
  ArrowRight,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { StatsCard, QuickActionCard, ProfileCompletionCard } from '@/components/dashboard/cards';

export default function StudentDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Student Academic Desk</span>
            </div>
            <h1 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl tracking-tight">
              Welcome back, {user?.name ?? 'Student'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Department of {user?.department ?? 'Computer Science & Engineering'} • Verified Enrolled Student
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/student/directory"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition"
            >
              <span>Explore Directory</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Metric Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          label="Alumni Network"
          value="50+"
          icon={Users}
          subtext="Verified graduates"
          href="/student/directory"
          hrefLabel="Browse alumni →"
          colorScheme="blue"
        />
        <StatsCard
          label="Job Opportunities"
          value="Active"
          icon={Briefcase}
          subtext="Internships & career roles"
          href="/student/jobs"
          hrefLabel="View jobs →"
          colorScheme="emerald"
        />
        <StatsCard
          label="Network Connections"
          value="Direct"
          icon={Handshake}
          subtext="Peer & mentor links"
          href="/student/connections"
          hrefLabel="Manage network →"
          colorScheme="amber"
        />
      </div>

      {/* Main Grid: Onboarding Checklist & Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Completion Onboarding Card */}
        <div className="lg:col-span-1">
          <ProfileCompletionCard
            name={user?.name ?? 'Student'}
            department={user?.department}
            hasBio={Boolean(user?.profile?.fullName && user?.profile?.skills?.length)}
            hasSkills={Boolean(user?.profile?.skills && user?.profile?.skills.length > 0)}
            hasJobOrGradYear={Boolean(user?.profile?.currentJob)}
            profileHref="/student/profile"
          />
        </div>

        {/* Quick Action Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuickActionCard
            title="Alumni Directory"
            description="Find and connect with graduates across global organizations and industries."
            icon={Users}
            href="/student/directory"
            colorScheme="blue"
            badge="Directory"
          />
          <QuickActionCard
            title="Internships & Jobs"
            description="Apply for positions posted exclusively for students by verified university alumni."
            icon={Briefcase}
            href="/student/jobs"
            colorScheme="emerald"
            badge="Careers"
          />
          <QuickActionCard
            title="Mentorship Network"
            description="Request career guidance, resume reviews, and industry insights from experienced alumni."
            icon={Handshake}
            href="/student/connections"
            colorScheme="amber"
            badge="Mentorship"
          />
          <QuickActionCard
            title="Student Profile"
            description="Showcase your academic department, skills, and portfolio links to future employers."
            icon={GraduationCap}
            href="/student/profile"
            colorScheme="indigo"
            badge="Portfolio"
          />
        </div>
      </div>
    </div>
  );
}
