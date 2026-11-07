'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { getAdminStats } from '@/lib/api/admin.api';
import { CardSkeleton } from '@/components/shared/skeletons';
import { ErrorState } from '@/components/shared/error-state';

export default function AdminDashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getAdminStats,
  });

  const stats = data?.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Super Admin Console
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Institutional governance, verification approval queues, and system integrity oversight.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pending Verifications
              </span>
              <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-slate-900">
              {stats?.pendingVerifications ?? 0}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              <Link
                href="/admin/users/verification"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Review queue →
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Users
              </span>
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-slate-900">
              {stats?.totalUsers ?? 0}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {stats?.approvedUsers ?? 0} verified members
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Listings
              </span>
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-slate-900">
              {stats?.totalJobs ?? 0}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Alumni-submitted opportunities
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pending Jobs
              </span>
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-slate-900">
              {stats?.pendingJobs ?? 0}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Awaiting moderation review
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Institutional Verification</h2>
              <p className="text-xs text-slate-500">Manage student and alumni enrollment verification</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Review submitted student IDs, academic records, and graduation credentials before approving
            institutional directory access. Requires 15-minute administrative re-authentication.
          </p>
          <Link
            href="/admin/users/verification"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <span>Open Verification Queue</span>
            <span>→</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Append-Only Audit Log</h2>
              <p className="text-xs text-slate-500">Immutable record of governance & security operations</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Every permission grant, verification decision, login anomaly, and administrative override is
            permanently recorded in the tamper-evident audit ledger.
          </p>
          <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700">
            <span>Audit Ledger Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

