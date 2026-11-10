import Link from 'next/link';
import { ArrowUpRight, Award, Bookmark, Calendar, Globe, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';

interface Story {
  id: string;
  title: string;
  alumnus: string;
  batch: string;
  role: string;
  company: string;
  category: string;
  readTime: string;
  excerpt: string;
  date: string;
}

const STORIES: Story[] = [
  {
    id: 'from-khulna-to-silicon-valley',
    title: 'From Campus Labs to Distributed Cloud Systems: Building Multi-Region Infrastructure',
    alumnus: 'Tahmina Rahman',
    batch: 'Class of 2019',
    role: 'Lead Software Architect',
    company: 'Apex Cloud Solutions',
    category: 'Cloud & Infrastructure',
    readTime: '6 min read',
    excerpt: 'How early open-source distributed systems experiments during final-year undergraduate thesis laid the bedrock for designing resilient multi-region architectures supporting millions of concurrent transactions.',
    date: 'Oct 14, 2026',
  },
  {
    id: 'scaling-fintech-for-millions',
    title: 'Designing Financial Inclusion: The Story Behind High-Throughput Digital Payments',
    alumnus: 'Tanvir Hossain',
    batch: 'Class of 2021',
    role: 'Staff Platform Engineer',
    company: 'bKash Limited',
    category: 'FinTech',
    readTime: '4 min read',
    excerpt: 'Navigating mission-critical distributed systems, asynchronous event streaming pipelines, and why junior engineers should prioritize computer science fundamentals over ephemeral tooling.',
    date: 'Oct 02, 2026',
  },
  {
    id: 'bridging-academia-and-ai',
    title: 'Applied Machine Learning in Healthcare: Diagnostic Computer Vision at Scale',
    alumnus: 'Dr. Anisur Rahman',
    batch: 'Class of 2015',
    role: 'Principal AI Researcher',
    company: 'BioVision Systems',
    category: 'Artificial Intelligence',
    readTime: '8 min read',
    excerpt: 'Translating academic biomedical research into clinically certified diagnosis models, and establishing recurring collaboration programs with university undergraduate research teams.',
    date: 'Sep 21, 2026',
  },
  {
    id: 'founding-a-logistics-scaleup',
    title: 'Zero to One: Solving Supply Chain Friction with Modern Full-Stack Platforms',
    alumnus: 'Monirul Islam',
    batch: 'Class of 2020',
    role: 'Co-founder & CTO',
    company: 'RapidRoute Logistics',
    category: 'Entrepreneurship',
    readTime: '5 min read',
    excerpt: 'From winning the campus engineering hackathon to raising venture capital: practical lessons on building a technology-first logistics product team in South Asia.',
    date: 'Sep 09, 2026',
  },
];

export default function StoriesPage() {
  const featured = STORIES[0];
  const restStories = STORIES.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold font-mono uppercase tracking-wider">
          <Sparkles size={14} /> Alumni Spotlights & Success Stories
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight m-0">
          Footprints of Excellence.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed m-0">
          Inspiring career roadmaps, startup founding journeys, and technical innovations pioneered by our distinguished graduates worldwide.
        </p>
      </div>

      {/* Featured Cover Story */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold shadow-xs">
                Featured Spotlight
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                {featured.category}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug m-0">
              {featured.title}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed m-0">
              {featured.excerpt}
            </p>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-900 m-0">
                {featured.alumnus}
              </p>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                {featured.role} at <strong>{featured.company}</strong> · {featured.batch}
              </p>
            </div>

            <Button asChild size="sm">
              <Link href="/alumni" className="inline-flex items-center gap-1 font-bold">
                Connect Profile <ArrowUpRight size={14} />
              </Link>
            </Button>
          </div>
        </div>

        {/* Featured Quote Panel */}
        <div className="lg:col-span-5 bg-linear-to-br from-slate-900 to-blue-950 text-white p-8 sm:p-12 flex flex-col justify-center space-y-4 border-t lg:border-t-0 lg:border-l border-slate-800">
          <span className="text-5xl text-blue-400 font-serif leading-none">“</span>
          <p className="text-lg sm:text-xl font-medium text-slate-200 leading-relaxed italic m-0">
            The best university networks do not measure impact by gates or prestige—they measure it by how far the previous class reaches back to pull the next class forward.
          </p>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-300 font-mono pt-4 m-0">
            — {featured.alumnus}, {featured.batch}
          </p>
        </div>
      </div>

      {/* Stories Grid */}
      <div>
        <SectionHeading
          eyebrow="CLASS RECORDS & SPOTLIGHTS"
          title="Stories Across Industries"
          description="Read about the technical hurdles and milestones of our graduates."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {restStories.map((story) => (
            <article
              key={story.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant="neutral">{story.category}</Badge>
                  <span className="text-[11px] text-slate-400 font-medium">{story.readTime}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug m-0">
                  {story.title}
                </h3>

                <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed m-0">
                  {story.excerpt}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 space-y-1">
                <p className="text-xs font-bold text-slate-900 m-0">{story.alumnus}</p>
                <p className="text-[11px] text-slate-500 m-0">
                  {story.role} · {story.company}
                </p>
                <p className="text-[10px] text-slate-400 font-mono m-0 mt-1">
                  {story.batch} · Published {story.date}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Share Your Story Banner */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-mono">
            SHARE YOUR JOURNEY
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5 m-0">
            Have an alumni milestone or company story to share?
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-lg m-0">
            Inspire undergraduates and fellow graduates with your career milestones, startup founding experiences, or open-source research.
          </p>
        </div>

        <Button asChild size="default" className="shrink-0">
          <Link href="/register">Submit Alumni Story</Link>
        </Button>
      </div>
    </div>
  );
}
