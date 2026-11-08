'use client';

import React from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Briefcase,
  Users,
  Handshake,
  Sparkles,
  User,
  HeartHandshake,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { StatsCard, QuickActionCard, ProfileCompletionCard } from '@/components/dashboard/cards';

export default function AlumniDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Verified Alumni Portal</span>
            </div>
            <h1 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl tracking-tight">
              Welcome back, {user?.name ?? 'Alumnus'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Department of {user?.department ?? 'Alumni Community'} • Verified University Graduate
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/alumni/jobs/create"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post Opportunity</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          label="My Postings"
          value="Manage"
          icon={Briefcase}
          subtext="Internships & career openings"
          href="/alumni/jobs/create"
          hrefLabel="Post new opening →"
          colorScheme="emerald"
        />
        <StatsCard
          label="Graduate Network"
          value="Connected"
          icon={Users}
          subtext="Fellow university alumni"
          href="/alumni/directory"
          hrefLabel="Search directory →"
          colorScheme="blue"
        />
        <StatsCard
          label="Mentorship"
          value="Active"
          icon={HeartHandshake}
          subtext="Incoming student inquiries"
          href="/alumni/connections"
          hrefLabel="View network →"
          colorScheme="purple"
        />
      </div>

      {/* Profile & Actions Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Strength */}
        <div className="lg:col-span-1">
          <ProfileCompletionCard
            name={user?.name ?? 'Alumnus'}
            department={user?.department}
            hasBio={Boolean(user?.profile?.fullName && user?.profile?.skills?.length)}
            hasSkills={Boolean(user?.profile?.skills && user?.profile?.skills.length > 0)}
            hasJobOrGradYear={Boolean(user?.profile?.currentJob)}
            profileHref="/alumni/profile"
          />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuickActionCard
            title="Post a Career Opening"
            description="Recruit talented students and graduates directly from your alma mater."
            icon={PlusCircle}
            href="/alumni/jobs/create"
            colorScheme="emerald"
            badge="Publish"
          />
          <QuickActionCard
            title="Alumni Directory"
            description="Re-connect with former classmates, batchmates, and faculty mentors."
            icon={Users}
            href="/alumni/directory"
            colorScheme="blue"
            badge="Directory"
          />
          <QuickActionCard
            title="Network & Inquiries"
            description="Review incoming connection requests from students seeking industry advice."
            icon={Handshake}
            href="/alumni/connections"
            colorScheme="purple"
            badge="Network"
          />
          <QuickActionCard
            title="Update Professional Info"
            description="Keep your current company, position, and mentorship availability updated."
            icon={User}
            href="/alumni/profile"
            colorScheme="amber"
            badge="Profile"
          />
        </div>
      </div>
    </div>
  );
}
