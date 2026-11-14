'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Clock,
  FileCheck2,
  HelpCircle,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { getPendingJobs } from '@/lib/api/jobs.api';
import { useAuthStore } from '@/store/auth-store';

export default function ModeratorDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const firstName = user?.name ? user.name.split(' ')[0] : 'Moderator';

  // Real backend query for pending jobs
  const pendingJobsQuery = useQuery({
    queryKey: ['pending-jobs', accessToken],
    queryFn: () => getPendingJobs(accessToken),
    enabled: Boolean(accessToken),
  });

  const pendingJobs = pendingJobsQuery.data?.data ?? [];
  const openReportsCount = 0;
  const flaggedContentCount = 0;
  const resolvedCasesCount = 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CAMPUS INTEGRITY & CONTENT STANDARDS"
        title={`Moderation Desk — ${firstName}.`}
        description="Verify hiring opportunities, protect student safety, review flagged abuse reports, and enforce university community guidelines."
        badge={<StatusBadge status="MODERATOR" label="Active Moderator Desk" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => pendingJobsQuery.refetch()}
              disabled={pendingJobsQuery.isFetching}
            >
              <RefreshCw size={13} className={pendingJobsQuery.isFetching ? 'animate-spin' : ''} /> Refresh Queues
            </Button>
            <Button asChild size="sm">
              <Link href="/moderator/jobs/pending">
                <Check size={14} /> Review Pending Jobs
              </Link>
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pending Job Reviews"
          value={pendingJobs.length}
          icon={Clock}
          iconColor="#D97706"
          subtext={pendingJobs.length > 0 ? 'Requires moderator review' : 'Queue all clear'}
          href="/moderator/jobs/pending"
          actionLabel="Open Queue"
        />
        <StatCard
          label="Open Abuse Reports"
          value={openReportsCount}
          icon={ShieldAlert}
          iconColor="#DC2626"
          subtext="No active community flags"
          href="/moderator/reports/open"
          actionLabel="View Reports"
        />
        <StatCard
          label="Flagged Content"
          value={flaggedContentCount}
          icon={HelpCircle}
          iconColor="#7C3AED"
          subtext="All articles compliant"
          href="/moderator/content"
          actionLabel="Review Stories"
        />
        <StatCard
          label="Resolved Cases"
          value={resolvedCasesCount}
          icon={CheckCircle2}
          iconColor="#16A34A"
          subtext="Institutional compliance verified"
          href="/moderator/activity"
          actionLabel="Audit Log"
        />
      </div>

      {/* Quick Launchpad */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 m-0">
          Moderation Actions
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <Button asChild size="sm" variant="secondary">
            <Link href="/moderator/jobs/pending">
              <Clock size={14} /> Review Pending Jobs ({pendingJobs.length})
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href="/moderator/reports/open">
              <ShieldAlert size={14} /> View Open Reports ({openReportsCount})
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href="/moderator/content">
              <HelpCircle size={14} /> Review Flagged Content
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href="/moderator/jobs/in-review">
              <FileCheck2 size={14} /> View In-Review Tasks
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/moderator/activity">
              View Moderation Activity Logs
            </Link>
          </Button>
        </div>
      </div>

      {/* 2-Column Split: Pending Jobs Queue Preview + Open Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Pending Job Queue */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0">Pending Career Listings</h3>
              <p className="text-xs text-slate-500 m-0">Awaiting approval before publishing</p>
            </div>
            <Link href="/moderator/jobs/pending" className="text-xs font-semibold text-blue-600 hover:underline">
              Full Queue ({pendingJobs.length}) →
            </Link>
          </div>

          {pendingJobs.length === 0 ? (
            <div className="text-center py-8 space-y-1.5">
              <ShieldCheck size={26} className="mx-auto text-emerald-500" />
              <p className="text-xs font-semibold text-slate-700 m-0">No pending jobs awaiting review</p>
              <p className="text-[11px] text-slate-400 m-0">All submitted career opportunities have been processed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingJobs.slice(0, 3).map((job) => (
                <div key={job.id} className="p-3.5 bg-slate-50 rounded-lg text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900 font-bold">{job.title}</strong>
                    <span className="text-[10px] text-amber-700 font-bold px-1.5 py-0.2 bg-amber-100 rounded">
                      Pending
                    </span>
                  </div>
                  <p className="text-slate-600 m-0">{job.company} · {job.location || 'Remote'}</p>
                  <p className="text-slate-400 text-[11px] m-0">Posted by: {job.postedBy?.name || 'Alumnus'}</p>
                  <div className="pt-2 flex justify-end">
                    <Button size="sm" asChild>
                      <Link href={`/moderator/jobs/${job.id}`}>Review Details</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Open Safety Reports */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0">Open Abuse & Incident Reports</h3>
              <p className="text-xs text-slate-500 m-0">Community flagged accounts and spam</p>
            </div>
            <Link href="/moderator/reports/open" className="text-xs font-semibold text-slate-600 hover:underline">
              Reports Queue (0) →
            </Link>
          </div>

          <div className="text-center py-8 space-y-1.5">
            <CheckCircle2 size={26} className="mx-auto text-emerald-500" />
            <p className="text-xs font-semibold text-slate-700 m-0">No open incident reports</p>
            <p className="text-[11px] text-slate-400 m-0">
              Campus network safety is calm. No active member conduct violations reported.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
