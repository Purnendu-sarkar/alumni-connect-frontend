'use client';

import { useQuery } from '@tanstack/react-query';
import { BriefcaseBusiness, RefreshCw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { JobCard } from '@/components/jobs/job-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CardGridSkeleton } from '@/components/dashboard/loading-skeleton';
import { EmptyState } from '@/components/dashboard/empty-state';
import { getJobs } from '@/lib/api/jobs.api';
import type { Job } from '@/types/domain';

export function JobsBoard() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const query = useQuery({
    queryKey: ['public-jobs'],
    queryFn: async () => {
      const res = await getJobs();
      return res.data ?? [];
    },
  });

  const jobs: Job[] = query.data ?? [];
  const types = ['ALL', 'FULL_TIME', 'INTERNSHIP', 'CONTRACT'];

  const matchingJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchSearch = `${job.title} ${job.company} ${job.location || ''} ${job.description || ''}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchType = filterType === 'ALL' || (job.employmentType || '').toUpperCase() === filterType;
      return matchSearch && matchType;
    });
  }, [jobs, search, filterType]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold font-mono uppercase tracking-wider">
          <BriefcaseBusiness size={14} /> The Opportunity Board
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight m-0">
          Work that starts with institutional trust.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed m-0">
          Every role here is posted by accredited alumni or verified employer partners who know the rigor of your university curriculum.
        </p>
      </div>

      {/* Search & Filter Toolbar using shadcn Card */}
      <Card className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles, companies, technologies, or locations…"
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono hidden sm:inline mr-1">
            Type:
          </span>
          {types.map((type) => (
            <Button
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType(type)}
            >
              {type === 'ALL' ? 'All Roles' : type.replace('_', '-')}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
            title="Refresh jobs"
          >
            <RefreshCw size={14} className={query.isFetching ? 'animate-spin' : ''} />
          </Button>
        </div>
      </Card>

      {/* Content Grid */}
      {query.isLoading ? (
        <CardGridSkeleton count={6} />
      ) : matchingJobs.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="No verified opportunities found"
          description={
            search || filterType !== 'ALL'
              ? 'Try adjusting your search keywords or filter options to discover other campus postings.'
              : 'There are currently no active job postings published for your institution. Check back soon!'
          }
          action={
            search || filterType !== 'ALL' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setFilterType('ALL');
                }}
              >
                Clear Filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matchingJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
