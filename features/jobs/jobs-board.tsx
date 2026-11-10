'use client';

import { useQuery } from '@tanstack/react-query';
import { BriefcaseBusiness, Filter, RefreshCw, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import { JobCard } from '@/components/jobs/job-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SectionHeading } from '@/components/ui/section-heading';
import { getJobs } from '@/lib/api/jobs.api';
import { demoJobs } from '@/features/shared/demo-data';

export function JobsBoard() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const query = useQuery({ queryKey: ['jobs'], queryFn: getJobs });
  const jobs = query.data?.data?.length ? query.data.data : demoJobs;

  const types = ['ALL', 'FULL_TIME', 'INTERNSHIP', 'CONTRACT'];

  const matchingJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchSearch = `${job.title} ${job.company} ${job.location} ${job.description || ''}`
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
        </div>
      </Card>

      {/* Listings Heading */}
      <SectionHeading
        eyebrow={query.isError ? 'CURATED DEMO POSITIONS' : 'LIVE OPPORTUNITIES'}
        title={`${matchingJobs.length} Positions Available`}
        description="Review requirements and apply directly with your academic credentials."
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
              <Sparkles size={12} /> Moderator Approved
            </span>
          </div>
        }
      />

      {/* Job Grid using shadcn JobCard */}
      {matchingJobs.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900 m-0">No matching career openings found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto m-0">
            Try adjusting your search terms or filter criteria to discover other opportunities.
          </p>
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
        </Card>
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
