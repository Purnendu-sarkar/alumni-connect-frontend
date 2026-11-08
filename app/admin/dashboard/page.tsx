'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Briefcase,
  Clock,
  FileText,
  GraduationCap,
  Handshake,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';

import { getAdminStats } from '@/lib/api/admin.api';
import { CardSkeleton } from '@/components/shared/skeletons';
import { ErrorState } from '@/components/shared/error-state';
import { StatsCard, QuickActionCard } from '@/components/dashboard/cards';

export default function AdminDashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getAdminStats,
  });

  const stats = data?.data;

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-2">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Root Governance</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Super Admin Console
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Institutional identity governance, verification queue processing, and security audit oversight.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to load admin statistics"
          message="Could not load system metrics from the administration service."
          onRetry={() => refetch()}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            label="Pending Verifications"
            value={stats?.pendingVerifications ?? 0}
            icon={Clock}
            subtext="Awaiting degree validation"
            href="/admin/users/verification"
            hrefLabel="Review queue →"
            colorScheme="amber"
          />
          <StatsCard
            label="Total Platform Members"
            value={stats?.totalUsers ?? 0}
            icon={Users}
            subtext={`${stats?.activeUsers ?? 0} active members`}
            href="/admin/users"
            hrefLabel="Manage users →"
            colorScheme="indigo"
          />
          <StatsCard
            label="Enrolled Students"
            value={stats?.totalStudents ?? 0}
            icon={GraduationCap}
            subtext="Active student accounts"
            colorScheme="blue"
          />
          <StatsCard
            label="Verified Alumni"
            value={stats?.totalAlumni ?? 0}
            icon={UserCheck}
            subtext="Approved graduates"
            colorScheme="emerald"
          />
          <StatsCard
            label="Active Opportunities"
            value={stats?.activeJobs ?? 0}
            icon={Briefcase}
            subtext="Published career listings"
            colorScheme="purple"
          />
          <StatsCard
            label="Established Connections"
            value={stats?.totalConnections ?? 0}
            icon={Handshake}
            subtext="Confirmed member ties"
            colorScheme="blue"
          />
        </div>
      )}

      {/* Quick Action Panels */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-4">Governance Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <QuickActionCard
            title="Alumni Identity Verification"
            description="Review graduation credentials, degree departments, and graduation years before admitting alumni to the verified network."
            icon={UserCheck}
            href="/admin/users/verification"
            colorScheme="amber"
            badge="Action Required"
          />
          <QuickActionCard
            title="Append-Only Audit Ledger"
            description="Inspect immutable cryptographic audit trails recording every verification decision, permission change, and security reauth."
            icon={FileText}
            href="/admin/audit-logs"
            colorScheme="indigo"
            badge="Security"
          />
        </div>
      </div>
    </div>
  );
}
