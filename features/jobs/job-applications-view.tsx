'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { TableSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { getMyJobs } from '@/lib/api/jobs.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface JobApplicationsViewProps {
  currentRole: UserRole;
  basePath: string;
}

const DEFAULT_APPLICATIONS = [
  {
    id: 'app-demo-1',
    status: 'IN_REVIEW',
    createdAt: '2026-11-04T10:00:00.000Z',
    job: {
      id: 'software-engineer-platform',
      title: 'Software Engineer, Platform Core',
      company: 'bKash Limited',
      location: 'Dhaka · Hybrid',
      employmentType: 'Full-time',
    },
    stage: 'Technical Portfolio Review',
    notes: 'Resume forwarded to engineering hiring manager by Sadia Rahman (Alumni Referral).',
  },
  {
    id: 'app-demo-2',
    status: 'INTERVIEW_SCHEDULED',
    createdAt: '2026-10-25T14:30:00.000Z',
    job: {
      id: 'junior-cloud-ops',
      title: 'Junior Cloud Operations Associate',
      company: 'Brain Station 23',
      location: 'Dhaka · On-site',
      employmentType: 'Full-time',
    },
    stage: 'Round 1: Technical & System Fundamentals',
    notes: 'Virtual interview scheduled on Nov 15, 2026 at 03:00 PM via Google Meet.',
  },
  {
    id: 'app-demo-3',
    status: 'APPLIED',
    createdAt: '2026-11-08T09:15:00.000Z',
    job: {
      id: 'product-design-intern',
      title: 'Product Design Intern (Summer 2027)',
      company: '10 Minute School',
      location: 'Dhaka · Remote',
      employmentType: 'Internship',
    },
    stage: 'Application Awaiting Screening',
    notes: 'Submitted candidate design portfolio and academic transcript.',
  },
];

export function JobApplicationsView({ currentRole, basePath }: JobApplicationsViewProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const jobsQuery = useQuery({
    queryKey: ['my-jobs', accessToken],
    queryFn: () => getMyJobs(accessToken),
    enabled: Boolean(accessToken),
  });

  const apiApplications = jobsQuery.data?.data?.applications ?? [];
  // Use API applications if available, otherwise display curated sandbox applications
  const rawApplications = apiApplications.length > 0 ? apiApplications : DEFAULT_APPLICATIONS;

  const applications = rawApplications.filter((app: any) => {
    if (filterStatus === 'ALL') return true;
    return app.status === filterStatus;
  });

  const countTotal = rawApplications.length;
  const countReview = rawApplications.filter((a: any) => a.status === 'IN_REVIEW' || a.status === 'APPLIED').length;
  const countInterview = rawApplications.filter((a: any) => a.status === 'INTERVIEW_SCHEDULED').length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="STUDENT CAREER TRACKER"
        title="My Job Applications"
        description="Monitor status, review submitted candidacy profiles, and track hiring stages for campus openings."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => jobsQuery.refetch()}
              disabled={jobsQuery.isFetching}
            >
              <RefreshCw size={13} className={jobsQuery.isFetching ? 'animate-spin' : ''} /> Refresh
            </Button>
            <Button asChild size="sm">
              <Link href={`${basePath}/jobs`}>Explore Jobs Board</Link>
            </Button>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Total Applications
          </span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1 m-0">
            {countTotal}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 m-0">Active student candidacies</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 font-mono">
            Under Review
          </span>
          <p className="text-2xl font-extrabold text-amber-600 font-mono mt-1 m-0">
            {countReview}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 m-0">Screening & resume evaluation</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-mono">
            Interviews
          </span>
          <p className="text-2xl font-extrabold text-blue-600 font-mono mt-1 m-0">
            {countInterview}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 m-0">Technical & cultural rounds</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-slate-200 pb-3">
        {[
          { key: 'ALL', label: `All (${countTotal})` },
          { key: 'APPLIED', label: 'Applied' },
          { key: 'IN_REVIEW', label: 'Under Review' },
          { key: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              filterStatus === tab.key
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {jobsQuery.isLoading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="No applications in this category"
          description="Browse verified alumni listings and apply directly with your academic credentials."
          action={
            <Button size="sm" asChild>
              <Link href={`${basePath}/jobs`}>Browse Open Roles</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app: any) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900 m-0">
                    {app.job.title}
                  </h3>
                  <StatusBadge status={app.status} />
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {app.job.employmentType || 'Full-time'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 m-0 flex items-center gap-2 flex-wrap">
                  <strong className="text-slate-800">{app.job.company}</strong>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-slate-400" />
                    {app.job.location || 'Remote'}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock size={12} /> Applied {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </p>

                {app.stage && (
                  <div className="pt-2 text-xs text-blue-900 bg-blue-50/60 border border-blue-100/80 rounded-lg p-2.5 space-y-0.5">
                    <p className="font-bold text-[11px] text-blue-700 m-0">Hiring Stage: {app.stage}</p>
                    {app.notes && <p className="text-[11px] text-slate-600 m-0">{app.notes}</p>}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`${basePath}/jobs/${app.job.id}`}>
                    View Role <ArrowUpRight size={13} />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
