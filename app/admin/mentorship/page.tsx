'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CardGridSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { getAdminMentorshipStats } from '@/lib/api/mentorship.api';
import { useAuthStore } from '@/store/auth-store';

export default function AdminMentorshipPage() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const {
    data: stats,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'mentorship-stats'],
    queryFn: async () => {
      const res = await getAdminMentorshipStats(accessToken);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to fetch mentorship telemetry');
      }
      return res.data;
    },
    enabled: Boolean(accessToken),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CAMPUS PROGRAM OVERSIGHT"
        title="Institutional Mentorship Governance"
        description="Monitor university-wide mentorship adoption, active student cohorts, guidance capacity, and program completion metrics."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Refresh Telemetry
            </Button>
            <Button size="sm" asChild>
              <Link href="/admin/directory">
                <Compass size={14} /> Directory Oversight
              </Link>
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <CardGridSkeleton count={4} />
      ) : isError ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
          <p className="font-bold m-0 mb-1">Failed to load mentorship statistics</p>
          <p className="m-0 text-rose-600">{(error as any)?.message || 'An unexpected error occurred.'}</p>
        </div>
      ) : stats ? (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
                  Active Cohorts
                </span>
                <HeartHandshake size={18} className="text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {stats.totalActive}
              </div>
              <p className="text-[11px] text-slate-500 m-0">Ongoing 1-on-1 coaching partnerships</p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
                  Pending Proposals
                </span>
                <Clock size={18} className="text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {stats.totalRequested}
              </div>
              <p className="text-[11px] text-slate-500 m-0">Inquiries awaiting mentor review</p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
                  Completed Sessions
                </span>
                <Award size={18} className="text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {stats.totalCompleted}
              </div>
              <p className="text-[11px] text-slate-500 m-0">Successfully concluded mentorships</p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
                  Total Engagements
                </span>
                <Activity size={18} className="text-purple-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {stats.totalMentorships}
              </div>
              <p className="text-[11px] text-slate-500 m-0">Lifetime campus guidance inquiries</p>
            </div>
          </div>

          {/* Breakdown & Telemetry Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 m-0">
                  Lifecycle Outcome Distribution
                </h3>
                <p className="text-xs text-slate-500 m-0 mt-0.5">
                  Resolution metrics across all historical mentorship submissions.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="font-semibold text-slate-700 flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600" /> Active Guidance
                  </span>
                  <span className="font-mono font-bold text-slate-900">{stats.totalActive}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="font-semibold text-slate-700 flex items-center gap-2">
                    <Clock size={15} className="text-amber-600" /> In Review / Clarification
                  </span>
                  <span className="font-mono font-bold text-slate-900">{stats.totalRequested}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="font-semibold text-slate-700 flex items-center gap-2">
                    <Award size={15} className="text-blue-600" /> Successfully Concluded
                  </span>
                  <span className="font-mono font-bold text-slate-900">{stats.totalCompleted}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="font-semibold text-slate-700 flex items-center gap-2">
                    <XCircle size={15} className="text-slate-400" /> Withdrawn by Student
                  </span>
                  <span className="font-mono font-bold text-slate-900">{stats.totalCancelled}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="font-semibold text-slate-700 flex items-center gap-2">
                    <XCircle size={15} className="text-rose-500" /> Declined / At Capacity
                  </span>
                  <span className="font-mono font-bold text-slate-900">{stats.totalRejected}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 m-0">
                  Institutional Program Policies
                </h3>
                <p className="text-xs text-slate-500 m-0 mt-0.5">
                  Governing rules enforced by the backend mentorship engine.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1">
                  <p className="font-bold text-blue-950 m-0">Max Mentee Capacity Guardrail</p>
                  <p className="m-0 text-blue-900">
                    Alumni can nurture up to a maximum of 5 concurrent active mentees. Inquiries are automatically throttled when capacity is exhausted.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <p className="font-bold text-slate-900 m-0">Dual-Participant Security Masking</p>
                  <p className="m-0">
                    Alumni workspace notes are strictly concealed from student mentees at the presenter boundary to maintain institutional privacy and frank evaluations.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <p className="font-bold text-slate-900 m-0">Bidirectional Relationship Severance</p>
                  <p className="m-0">
                    If either party blocks the other in the directory, all active mentorships and pending proposals between them are automatically cancelled immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}