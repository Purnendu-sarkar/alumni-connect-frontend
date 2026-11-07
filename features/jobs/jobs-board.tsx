'use client';

import { useQuery } from '@tanstack/react-query';
import { Briefcase, Building, MapPin, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { JobListSkeleton } from '@/components/shared/skeletons';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { SearchInput } from '@/components/shared/search-input';
import { getJobs } from '@/lib/api/jobs.api';
import type { Job } from '@/types/domain';

export function JobsBoard() {
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['jobs', search],
    queryFn: () => getJobs({ search: search || undefined }),
  });

  const jobs: Job[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <SearchInput
            placeholder="Search roles, companies, locations..."
            onSearch={setSearch}
          />
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Briefcase className="h-4 w-4 text-blue-600" />
          <span>Alumni-posted, moderator-approved opportunities</span>
        </div>
      </div>

      {isLoading ? (
        <JobListSkeleton count={5} />
      ) : isError ? (
        <ErrorState
          title="Failed to load job listings"
          message="Could not load the opportunity board. Please check your connection and retry."
          onRetry={() => refetch()}
        />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No open positions found"
          description={
            search
              ? `No job openings matched "${search}". Try searching for different keywords or titles.`
              : 'There are currently no active job listings. Please check back later.'
          }
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow transition"
            >
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-900">{job.title}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Building className="h-3.5 w-3.5 text-slate-400" />
                    {job.company}
                  </span>
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {job.location}
                    </span>
                  )}
                  {job.employmentType && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-600">
                      {job.employmentType}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {job.applicationUrl ? (
                  <a
                    href={job.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                  >
                    Apply Externally
                  </a>
                ) : (
                  <button
                    type="button"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                  >
                    Quick Apply
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
