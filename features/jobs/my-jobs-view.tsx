'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  RefreshCw,
  Users,
  XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { TableSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { getMyJobs } from '@/lib/api/jobs.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface MyJobsViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function MyJobsView({ currentRole, basePath }: MyJobsViewProps) {
  const accessToken = useAuthStore((state) => state.accessToken);

  const jobsQuery = useQuery({
    queryKey: ['my-jobs', accessToken],
    queryFn: () => getMyJobs(accessToken),
    enabled: Boolean(accessToken),
  });

  const postedJobs = jobsQuery.data?.data?.postedJobs ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="RECRUITMENT DESK"
        title="My Posted Opportunities"
        description="Track review status, monitor campus applicants, and maintain your published career listings."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => jobsQuery.refetch()}
              disabled={jobsQuery.isFetching}
            >
              <RefreshCw size={13} className={jobsQuery.isFetching ? 'animate-spin' : ''} /> Refresh
            </Button>
            <Button asChild size="sm">
              <Link href={`${basePath}/jobs/create`}>
                <Plus size={14} /> Post New Opportunity
              </Link>
            </Button>
          </div>
        }
      />

      {jobsQuery.isLoading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : postedJobs.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="No career opportunities posted yet"
          description="Help students and fellow alumni jumpstart their careers by sharing openings from your organization."
          action={
            <Button size="sm" asChild>
              <Link href={`${basePath}/jobs/create`}>
                <Plus size={14} /> Post Your First Job
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
          {postedJobs.map((job) => {
            const status = job.status || 'APPROVED';
            return (
              <div
                key={job.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-slate-900 m-0">{job.title}</h3>
                    <StatusBadge status={status} />
                  </div>
                  <p className="text-xs text-slate-500 m-0">
                    <strong>{job.company}</strong> · {job.location || 'Remote'} · {job.employmentType || 'Full-time'}
                  </p>
                  <p className="text-[11px] text-slate-400 m-0 mt-1">
                    Submitted: {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={`${basePath}/applications/received?jobId=${job.id}`}>
                      <Users size={14} /> View Applicants
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`${basePath}/jobs/${job.id}`}>
                      Details
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
