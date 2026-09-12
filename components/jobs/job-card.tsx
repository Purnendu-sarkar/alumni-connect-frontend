import Link from 'next/link';
import { ArrowUpRight, BriefcaseBusiness, MapPin } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/format';
import type { Job } from '@/types/domain';

export function JobCard({ job }: { job: Job }) {
  return (
    <article className="job-card">
      <div className="job-card__head"><Badge variant="warning">{job.employmentType ?? 'Opportunity'}</Badge><span>{formatDate(job.createdAt)}</span></div>
      <h3>{job.title}</h3>
      <p className="job-card__company">{job.company}</p>
      <p className="job-card__meta"><MapPin size={16} /> {job.location ?? 'Location flexible'} <span>•</span><BriefcaseBusiness size={16} /> Alumni posted</p>
      <p>{job.description}</p>
      <Link href={`/jobs/${job.id}`} className="text-link">Read listing <ArrowUpRight size={16} /></Link>
    </article>
  );
}
