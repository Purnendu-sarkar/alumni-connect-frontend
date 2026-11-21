'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { stripHtmlToPlainText } from '@/lib/utils/text';
import { EmptyState } from '@/components/dashboard/empty-state';
import { CardGridSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { JobApplyModal } from '@/components/jobs/job-apply-modal';
import { getJobs } from '@/lib/api/jobs.api';
import { useAuthStore } from '@/store/auth-store';
import type { Job, UserRole } from '@/types/domain';

interface JobsListViewProps {
  currentRole: UserRole;
  basePath: string;
}

const CATEGORIES = [
  'All',
  'Software Engineering',
  'Product & Design',
  'Data & AI',
  'Business & Marketing',
  'Finance & Accounting',
  'Operations',
  'General',
];

const EMPLOYMENT_TYPES = [
  { label: 'All Types', value: 'All' },
  { label: 'Full-time', value: 'FULL_TIME' },
  { label: 'Part-time', value: 'PART_TIME' },
  { label: 'Internship', value: 'INTERNSHIP' },
  { label: 'Contract', value: 'CONTRACT' },
  { label: 'Remote', value: 'REMOTE' },
];

const WORK_MODES = [
  { label: 'All Modes', value: 'All' },
  { label: 'On-site', value: 'ON_SITE' },
  { label: 'Hybrid', value: 'HYBRID' },
  { label: 'Remote', value: 'REMOTE' },
];

export function JobsListView({ currentRole, basePath }: JobsListViewProps) {
  const user = useAuthStore((state) => state.user);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [employmentType, setEmploymentType] = useState('All');
  const [workMode, setWorkMode] = useState('All');
  const [referralOnly, setReferralOnly] = useState(false);
  const [page, setPage] = useState(1);

  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // 300ms Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const jobsQuery = useQuery({
    queryKey: [
      'published-jobs',
      debouncedSearch,
      category,
      employmentType,
      workMode,
      referralOnly,
      page,
    ],
    queryFn: async () => {
      const res = await getJobs({
        search: debouncedSearch || undefined,
        category: category !== 'All' ? category : undefined,
        employmentType: employmentType !== 'All' ? employmentType : undefined,
        workMode: workMode !== 'All' ? workMode : undefined,
        referralOnly: referralOnly || undefined,
        page,
        limit: 18,
      });
      return res.data ?? [];
    },
  });

  const jobsList: Job[] = jobsQuery.data ?? [];

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setCategory('All');
    setEmploymentType('All');
    setWorkMode('All');
    setReferralOnly(false);
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(debouncedSearch) ||
    category !== 'All' ||
    employmentType !== 'All' ||
    workMode !== 'All' ||
    referralOnly;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CAMPUS CAREER ACCELERATOR"
        title="Verified Job Opportunities"
        description="Explore exclusive internships, early-career roles, and corporate referrals shared by accredited alumni."
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

            {currentRole === 'STUDENT' ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`${basePath}/applications`}>My Applications</Link>
              </Button>
            ) : null}

            {currentRole === 'ALUMNI' ? (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href={`${basePath}/jobs/my-jobs`}>My Posted Jobs</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`${basePath}/jobs/create`}>
                    <Plus size={14} /> Post Opportunity
                  </Link>
                </Button>
              </>
            ) : null}
          </div>
        }
      />

      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Multi-Filter Search Bar */}
      <Card className="p-4 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by role title, hiring company, skills, or city…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Employment Type */}
            <select
              value={employmentType}
              onChange={(e) => {
                setEmploymentType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            {/* Work Mode */}
            <select
              value={workMode}
              onChange={(e) => {
                setWorkMode(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              {WORK_MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            {/* Referral Only Toggle */}
            <label className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer select-none hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={referralOnly}
                onChange={(e) => {
                  setReferralOnly(e.target.checked);
                  setPage(1);
                }}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <Sparkles size={13} className="text-amber-500" />
              <span>Alumni Referral</span>
            </label>
          </div>
        </div>

        {/* Category Pill Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono shrink-0 mr-1">
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                category === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      {/* Jobs Grid */}
      {jobsQuery.isLoading ? (
        <CardGridSkeleton count={6} />
      ) : jobsList.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="No verified opportunities found"
          description={
            hasActiveFilters
              ? 'No jobs match your current search filters. Try clearing or relaxing some criteria.'
              : 'There are currently no active career openings posted on the campus board. Check back soon!'
          }
          action={
            hasActiveFilters ? (
              <Button size="sm" variant="secondary" onClick={handleResetFilters}>
                Reset All Filters
              </Button>
            ) : currentRole === 'ALUMNI' ? (
              <Button size="sm" asChild>
                <Link href={`${basePath}/jobs/create`}>
                  <Plus size={14} /> Post First Opening
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobsList.map((job) => {
            const isAuthor = user?.id && job.postedBy?.id === user.id;
            const hasApplied = Boolean(job.hasApplied);

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all duration-200"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="warning">{job.employmentType ?? 'Full-time'}</Badge>
                      {job.referralAvailable && (
                        <Badge variant="secondary" className="bg-amber-50 text-amber-800 border-amber-200">
                          <Sparkles size={11} className="mr-1 text-amber-600 inline" /> Referral
                        </Badge>
                      )}
                    </div>
                    {job.daysLeft !== undefined && (
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <Clock size={12} /> {job.daysLeft === 0 ? 'Last day' : `${job.daysLeft}d left`}
                      </span>
                    )}
                  </div>

                  {/* Title & Company */}
                  <h3 className="text-base font-bold text-slate-900 m-0 line-clamp-1 hover:text-blue-600 transition-colors">
                    <Link href={`${basePath}/jobs/${job.id}`}>{job.title}</Link>
                  </h3>

                  <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mt-1.5 m-0">
                    <Building2 size={13} className="text-slate-400 shrink-0" />
                    <span>{job.company}</span>
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-2.5 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" />
                      {job.location ?? 'Remote'}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-700">
                      {job.salary || 'Negotiable'}
                    </span>
                  </div>

                  {job.description && (
                    <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed m-0">
                      {job.descriptionSnippet || stripHtmlToPlainText(job.description)}
                    </p>
                  )}

                  {/* Posted By Card */}
                  {job.postedBy && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate">
                        Posted by <strong>{job.postedBy.name}</strong>
                        {job.postedBy.batch ? ` · ${job.postedBy.batch}` : ''}
                      </span>
                      {job.postedBy.verified && (
                        <span className="text-blue-600 font-semibold flex items-center gap-0.5 shrink-0" title="Verified Alumni">
                          <UserCheck size={13} />
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button variant="ghost" size="sm" asChild className="text-xs h-8">
                    <Link href={`${basePath}/jobs/${job.id}`}>View Details</Link>
                  </Button>

                  {isAuthor ? (
                    <Button variant="secondary" size="sm" asChild className="text-xs h-8">
                      <Link href={`${basePath}/jobs/my-jobs`}>Manage Listing</Link>
                    </Button>
                  ) : hasApplied ? (
                    <Badge variant="success" className="text-xs">
                      Applied ({job.viewerApplicationStatus || 'Under Review'})
                    </Badge>
                  ) : currentRole === 'STUDENT' || currentRole === 'ALUMNI' ? (
                    <Button
                      size="sm"
                      onClick={() => setApplyingJob(job)}
                      className="text-xs h-8 font-semibold"
                    >
                      Apply Now
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reusable Apply Modal */}
      <JobApplyModal
        job={applyingJob}
        isOpen={Boolean(applyingJob)}
        onClose={() => setApplyingJob(null)}
        onSuccess={(title) => {
          setSuccessToast(`Your application for "${title}" has been submitted successfully to the alumni recruiter!`);
          setTimeout(() => setSuccessToast(null), 6000);
        }}
      />
    </div>
  );
}
