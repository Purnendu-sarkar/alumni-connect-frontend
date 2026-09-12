import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, MapPin } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { demoJobs } from '@/features/shared/demo-data';

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = demoJobs.find((item) => item.id === slug) ?? demoJobs[0];
  return <section className="page-shell job-detail"><Link href="/jobs" className="back-link"><ArrowLeft size={16} /> Back to job board</Link><Badge variant="warning">{job.employmentType}</Badge><h1>{job.title}</h1><p className="job-detail__company">{job.company} <span>·</span> <MapPin size={17} /> {job.location}</p><div className="job-detail__grid"><article><p className="eyebrow">THE ROLE</p><p className="lede">{job.description}</p><p>Bring curiosity, clarity, and the willingness to make a meaningful contribution from the first day.</p></article><aside><p className="eyebrow">POSTED BY</p><strong>{job.postedBy.name}</strong><p>{job.postedBy.currentCompany}</p><Button asChild><a href={job.applicationUrl ?? `mailto:${job.applicationEmail}`}>Apply now <ArrowUpRight size={17} /></a></Button></aside></div></section>;
}
