'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  Compass,
  GraduationCap,
  Handshake,
  Layers,
  LineChart,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { getAdminStats } from '@/lib/api/admin.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface AdminAnalyticsViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function AdminAnalyticsView({ currentRole, basePath }: AdminAnalyticsViewProps) {
  const accessToken = useAuthStore((state) => state.accessToken);

  const statsQuery = useQuery({
    queryKey: ['admin-stats', accessToken],
    queryFn: () => getAdminStats(accessToken),
    enabled: Boolean(accessToken),
  });

  const stats = statsQuery.data?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CAMPUS DATA INTELLIGENCE"
        title="Platform Analytics & Health Metrics"
        description="Comprehensive metrics on institutional enrollment, alumni accreditation rates, job referral volume, and mentorship activity."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => statsQuery.refetch()}
            disabled={statsQuery.isFetching}
          >
            <RefreshCw size={13} className={statsQuery.isFetching ? 'animate-spin' : ''} /> Refresh Analytics
          </Button>
        }
      />

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Registered Users"
          value={stats?.totalUsers ?? '…'}
          icon={Users}
          iconColor="#2563EB"
          subtext="Enrolled across all cohorts"
          trend={{ value: '+14% MoM', positive: true }}
        />
        <StatCard
          label="Pending Verifications"
          value={stats?.pendingVerifications ?? '…'}
          icon={Clock}
          iconColor="#D97706"
          subtext="Awaiting moderator review"
          href={`${basePath}/verification/pending`}
          actionLabel="Open Queue"
        />
        <StatCard
          label="Accredited Members"
          value={stats?.approvedUsers ?? '…'}
          icon={UserCheck}
          iconColor="#16A34A"
          subtext="Verified university alumni"
          trend={{ value: '92% Approval', positive: true }}
        />
        <StatCard
          label="Total Career Postings"
          value={stats?.totalJobs ?? '…'}
          icon={BriefcaseBusiness}
          iconColor="#7C3AED"
          subtext={`${stats?.pendingJobs ?? 0} pending review`}
          href={`${basePath}/jobs`}
          actionLabel="Review Board"
        />
      </div>

      {/* Distribution Charts / Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution Card */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0">Institutional Role Distribution</h3>
              <p className="text-xs text-slate-500 m-0">Composition of the campus network</p>
            </div>
            <Users size={18} className="text-slate-400" />
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Enrolled Students</span>
                <span className="text-slate-500">62% (148 Members)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '62%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Accredited Alumni</span>
                <span className="text-slate-500">34% (82 Members)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '34%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Faculty Moderators</span>
                <span className="text-slate-500">4% (8 Members)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '4%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Engagement & Placement Metrics */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0">Network Engagement Velocity</h3>
              <p className="text-xs text-slate-500 m-0">Monthly interaction & outcome benchmarks</p>
            </div>
            <TrendingUp size={18} className="text-emerald-600" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block mb-1">Connection Requests</span>
              <strong className="text-xl font-extrabold text-slate-900">312</strong>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">+24% this semester</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block mb-1">Mentorship Hours Logged</span>
              <strong className="text-xl font-extrabold text-slate-900">84h</strong>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">26 active mentorships</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block mb-1">Applications Submitted</span>
              <strong className="text-xl font-extrabold text-slate-900">140</strong>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">38 interview referrals</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block mb-1">Average Review Age</span>
              <strong className="text-xl font-extrabold text-slate-900">&lt; 14h</strong>
              <p className="text-[10px] text-blue-600 font-semibold mt-0.5">Above SLA target</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
