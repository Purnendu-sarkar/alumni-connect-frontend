'use client';

import { useQuery } from '@tanstack/react-query';
import { BriefcaseBusiness, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { JobCard } from '@/components/jobs/job-card';
import { Input } from '@/components/ui/input';
import { SectionHeading } from '@/components/ui/section-heading';
import { getJobs } from '@/lib/api/jobs.api';
import { demoJobs } from '@/features/shared/demo-data';

export function JobsBoard() {
  const [search, setSearch] = useState('');
  const query = useQuery({ queryKey: ['jobs'], queryFn: getJobs });
  const jobs = query.data?.data?.length ? query.data.data : demoJobs;
  const matchingJobs = useMemo(() => jobs.filter((job) => `${job.title} ${job.company} ${job.location}`.toLowerCase().includes(search.toLowerCase())), [jobs, search]);

  return <section className="page-shell jobs-page"><p className="eyebrow">THE OPPORTUNITY BOARD</p><h1>Work that starts with trust.</h1><p className="lede">Every role here comes from a person who understands where you are coming from.</p><div className="jobs-page__tools"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search roles, companies, locations…" aria-label="Search jobs" /><p><BriefcaseBusiness size={18} /> Alumni-posted, moderator-approved.</p></div><SectionHeading eyebrow={query.isError ? 'CURATED PREVIEW' : 'LIVE LISTINGS'} title={`${matchingJobs.length} openings`} /><div className="job-list">{matchingJobs.map((job) => <JobCard key={job.id} job={job} />)}</div>{matchingJobs.length === 0 ? <p className="empty-state"><Search size={24} />No open role matches that search.</p> : null}</section>;
}
