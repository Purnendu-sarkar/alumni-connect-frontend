import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';

import { AlumniCard } from '@/components/alumni/alumni-card';
import { JobCard } from '@/components/jobs/job-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { demoAlumni, demoJobs } from '@/features/shared/demo-data';
import { formatCompactNumber } from '@/lib/utils/format';

const proofPoints = [
  {
    number: '01',
    title: 'Verified Institutional Community',
    description: 'Every profile is authenticated against university graduation and enrollment records. Zero spam or commercial headhunters.',
    icon: ShieldCheck,
  },
  {
    number: '02',
    title: 'Direct 1-on-1 Mentorship',
    description: 'Book thirty-minute career advisory sessions with alumni who have walked your specific department and career roadmap.',
    icon: HeartHandshake,
  },
  {
    number: '03',
    title: 'Alumni-Shared Career Openings',
    description: 'Access curated internships, graduate programs, and software roles shared directly by alumni working inside hiring teams.',
    icon: TrendingUp,
  },
];

export default function HomePage() {
  return (
    <div className="space-y-16 lg:space-y-24 py-8 md:py-12">
      {/* Hero Section using shadcn Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-xl border-slate-800">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Sparkles size={14} className="text-blue-400" />
              OFFICIAL ALUMNI & STUDENT ENGAGEMENT PLATFORM
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] m-0">
              Your next big career move has a familiar face.
            </h1>

            <p className="text-base sm:text-xl text-slate-300 max-w-2xl leading-relaxed m-0">
              Connect with the graduates who took the road before you. Seek authentic career guidance, discover curated campus opportunities, and strengthen your lifelong university network.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md">
                <Link href="/alumni">
                  Find Your Alumni <ArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-white font-semibold">
                <Link href="/register">Join the Network</Link>
              </Button>
            </div>

            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>Verified Members</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-400" />
                <span>1-on-1 Mentorship</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-cyan-400" />
                <span>Zero Commercial Ads</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap size={16} className="text-indigo-400" />
                <span>Institutional Trust</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Proof Points Strip using shadcn Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {proofPoints.map((point) => {
            const Icon = point.icon;
            return (
              <Card
                key={point.number}
                className="hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    <Icon size={20} />
                  </div>
                  <span className="font-mono text-xs font-extrabold text-slate-400">
                    STEP {point.number}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 m-0">
                  {point.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed m-0">
                  {point.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Directory Preview Section using shadcn AlumniCard */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="CAMPUS DIRECTORY"
          title="Graduates Worth Knowing"
          description="Search and connect across departments, graduation years, and leading industry employers."
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/alumni" className="inline-flex items-center gap-1.5 font-bold">
                Explore Full Directory <ArrowUpRight size={14} />
              </Link>
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {demoAlumni.slice(0, 3).map((alumnus) => (
            <AlumniCard key={alumnus.id} alumnus={alumnus} />
          ))}
        </div>
      </section>

      {/* Mentorship Callout Banner using shadcn Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-blue-600 text-white rounded-3xl p-8 sm:p-12 shadow-lg border-blue-600 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-200 font-mono">
              THE MENTORSHIP DESK
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight m-0">
              One honest conversation can redefine your career direction.
            </h2>
            <p className="text-sm text-blue-100 leading-relaxed m-0">
              Request a focused thirty-minute session with an alumnus who has successfully navigated the path you are considering. Review your portfolio, prepare for technical interviews, and receive candid industry perspective.
            </p>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="bg-white hover:bg-slate-100 text-blue-900 font-bold shadow-xs border-white">
              <Link href="/mentorship">Explore Mentors</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-blue-400 text-white hover:bg-blue-700 font-semibold">
              <Link href="/register">Become a Mentor</Link>
            </Button>
          </div>
        </Card>
      </section>

      {/* Job Opportunities Section using shadcn JobCard */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="ON THE BOARD"
          title="Work Worth Showing Up For"
          description="Curated campus and graduate opportunities submitted by alumni in good standing."
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/jobs" className="inline-flex items-center gap-1.5 font-bold">
                See All Opportunities <ArrowUpRight size={14} />
              </Link>
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoJobs.slice(0, 3).map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      {/* Network Metrics Stats using shadcn Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-blue-400 font-mono">
              {formatCompactNumber(2400)}+
            </span>
            <p className="text-xs uppercase tracking-wider font-bold text-slate-400 m-0">
              Verified Members
            </p>
            <p className="text-[11px] text-slate-500 m-0">Graduates & Students across 12 faculties</p>
          </div>

          <div className="space-y-1 pt-6 md:pt-0">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">
              180+
            </span>
            <p className="text-xs uppercase tracking-wider font-bold text-slate-400 m-0">
              Active Mentors
            </p>
            <p className="text-[11px] text-slate-500 m-0">Offering mock interviews & code reviews</p>
          </div>

          <div className="space-y-1 pt-6 md:pt-0">
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono">
              40+
            </span>
            <p className="text-xs uppercase tracking-wider font-bold text-slate-400 m-0">
              Curated Opportunities
            </p>
            <p className="text-[11px] text-slate-500 m-0">Direct referrals with hiring alumni</p>
          </div>
        </Card>
      </section>

      {/* Upcoming Event & Join Banner using shadcn Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shrink-0">
              <CalendarDays size={28} />
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-blue-600 font-mono">
                CAMPUS GATHERING
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 m-0">
                Annual Alumni Homecoming & Symposium
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-lg leading-relaxed m-0">
                Return to campus for keynotes, workshops, and roundtables with fellow graduates who are pioneering modern engineering and leadership.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Button asChild size="default">
              <Link href="/events">Browse Events</Link>
            </Button>
            <Button asChild variant="outline" size="default">
              <Link href="/register">Create Profile</Link>
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
