import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, MessageSquareText, Sparkles } from 'lucide-react';

import { JobCard } from '@/components/jobs/job-card';
import { Button } from '@/components/ui/button';
import { demoJobs } from '@/features/shared/demo-data';

export default function DashboardPage() {
  return <section className="dashboard-page"><p className="eyebrow">MEMBER DESK / SEPTEMBER</p><h1>Good morning, Purnendu.</h1><p className="lede">Your network is active. Here is where the conversation is moving today.</p><div className="dashboard-stats"><article><CheckCircle2 size={24} /><strong>12</strong><span>PROFILE VIEWS</span></article><article><MessageSquareText size={24} /><strong>03</strong><span>NEW CONNECTIONS</span></article><article><Sparkles size={24} /><strong>05</strong><span>MENTOR MATCHES</span></article></div><div className="dashboard-split"><section><div className="section-heading"><div><p className="eyebrow">FOR YOU</p><h2>Fresh from the board.</h2></div><Link href="/jobs" className="text-link">All jobs <ArrowUpRight size={16} /></Link></div><div className="job-list">{demoJobs.slice(0, 2).map((job) => <JobCard key={job.id} job={job} />)}</div></section><aside className="dashboard-note"><p className="eyebrow">NEXT ACTION</p><h2>Complete your profile.</h2><p>Add the kind of questions you would like help answering so the right people can find you.</p><Button asChild variant="secondary"><Link href="/dashboard/profile">Edit profile</Link></Button></aside></div></section>;
}
