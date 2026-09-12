import Link from 'next/link';
import { ArrowUpRight, BriefcaseBusiness, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { JobCard } from '@/components/jobs/job-card';
import { SectionHeading } from '@/components/ui/section-heading';
import { demoJobs } from '@/features/shared/demo-data';

export default function MyJobsPage() {
  return (
    <section className="dashboard-page">
      <p className="eyebrow">CAREER DESK</p>
      <h1>Opportunities worth sharing.</h1>
      <p className="lede">Review trusted roles from your alumni network, then make your next move with context.</p>
      <SectionHeading eyebrow="SAVED FOR YOU" title="Roles with a warm introduction." />
      <div className="job-list">{demoJobs.slice(0, 2).map((job) => <JobCard key={job.id} job={job} />)}</div>
      <div className="dashboard-note"><p className="eyebrow"><ShieldCheck size={14} /> MODERATED BOARD</p><h2>Post with accountability.</h2><p>Job creation and application history will appear here for authorised alumni once those live API flows are connected.</p><Button asChild><Link href="/jobs">Browse all roles <ArrowUpRight size={16} /></Link></Button></div>
      <p className="empty-state"><BriefcaseBusiness size={22} /> Your saved roles will stay in this workspace.</p>
    </section>
  );
}
