import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { JobCard } from '@/components/jobs/job-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { LandingAuthCtas } from '@/components/public/landing-auth-ctas';
import { HeroSplitSection } from '@/components/public/hero-split-section';
import { TelemetryStrip } from '@/components/public/telemetry-strip';
import { DepartmentGrid } from '@/components/public/department-grid';
import { EcosystemRolesSection } from '@/components/public/ecosystem-roles-section';
import { FeaturedStoriesSection } from '@/components/public/featured-stories-section';
import { CampusEventsDualFeed } from '@/components/public/campus-events-dual-feed';
import { getPublicOverview } from '@/lib/api/public.api';
import { getJobs } from '@/lib/api/jobs.api';
import type { Job } from '@/types/domain';

export default async function HomePage() {
  const [overview, jobsRes] = await Promise.all([
    getPublicOverview(),
    getJobs({ limit: 3 }).catch(() => ({ data: [] })),
  ]);

  const rawJobs = (jobsRes.data && jobsRes.data.length > 0) ? jobsRes.data : overview.featuredJobs;

  const displayJobs: Job[] = rawJobs.slice(0, 3).map((item) => {
    const isDomainJob = 'employmentType' in item && typeof item.employmentType === 'string';
    if (isDomainJob) {
      return item as Job;
    }
    const publicJob = item as typeof overview.featuredJobs[number];
    return {
      id: publicJob.id,
      title: publicJob.title,
      company: publicJob.company,
      location: publicJob.location,
      employmentType: publicJob.jobType ?? 'Full-time',
      workMode: publicJob.workMode ?? 'ON_SITE',
      description: publicJob.descriptionSnippet,
      descriptionSnippet: publicJob.descriptionSnippet,
      salary: publicJob.salaryRange,
      deadline: publicJob.deadline,
      createdAt: publicJob.postedAt,
    };
  });

  return (
    <div className="space-y-16 lg:space-y-24 py-8 md:py-12 animate-fade-in">
      {/* 1. Executive Split-Screen Hero */}
      <HeroSplitSection
        metrics={overview.metrics}
        featuredAlumni={overview.featuredAlumni}
        heroBannerUrl={overview.featuredEvents[0]?.bannerUrl}
      />

      {/* 2. Real-Time Institutional Telemetry Strip */}
      <TelemetryStrip metrics={overview.metrics} />

      {/* 3. Academic Departments & Alumni Footprint */}
      <DepartmentGrid departments={overview.departments} />

      {/* 4. Verified Institutional Ecosystem ("How It Works") */}
      <EcosystemRolesSection />

      {/* 5. Live Career Opportunities Board */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="ON THE BOARD"
          title="Work Worth Showing Up For"
          description="Curated campus and engineering opportunities submitted by alumni in good standing."
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/jobs" className="inline-flex items-center gap-1.5 font-bold">
                <span>Explore All {overview.metrics.publishedJobsCount.toLocaleString()}+ Opportunities</span>
                <ArrowUpRight size={14} />
              </Link>
            </Button>
          }
        />

        {displayJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center bg-slate-50 border border-slate-200">
            <p className="text-sm font-medium text-slate-600 m-0">
              Verified campus career opportunities are published regularly by accredited alumni. Check back soon or browse the full opportunity board.
            </p>
          </Card>
        )}
      </section>

      {/* 6. Inspiring Alumni Success Stories */}
      <FeaturedStoriesSection stories={overview.featuredStories} />

      {/* 7. Upcoming Campus Events & Official Notices Dual Feed */}
      <CampusEventsDualFeed
        events={overview.featuredEvents}
        announcements={overview.latestAnnouncements}
      />

      {/* 8. Executive Call-to-Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-8 sm:p-12 lg:p-14 border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="space-y-3 max-w-xl relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-300 font-mono">
              INSTITUTIONAL MEMBERSHIP · NORTH WESTERN UNIVERSITY
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight m-0">
              Be part of North Western University&apos;s growing alumni network.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed m-0">
              Whether you are graduating this term or established in your career, your perspective is vital to our academic community. Connect, mentor, and discover alumni-shared opportunities.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <LandingAuthCtas variant="bottom-banner" />
          </div>
        </Card>
      </section>
    </div>
  );
}
