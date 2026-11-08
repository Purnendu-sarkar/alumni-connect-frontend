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
    title: 'From Khulna to Silicon Valley: Building Resilient Cloud Infrastructures',
    alumnus: 'Tahmina Rahman',
    batch: 'Class of 2019',
    role: 'Lead Software Architect',
    company: 'Apex Cloud Solutions',
    category: 'Engineering & Cloud',
    readTime: '6 min read',
    excerpt: 'How early open-source contributions at North Western University laid the bedrock for designing multi-region cloud services supporting millions of concurrent transactions.',
    date: 'Oct 14, 2026',
  },
  {
    id: 'scaling-fintech-for-millions',
    title: 'Designing Financial Inclusion: The Story Behind Seamless Digital Payments',
    alumnus: 'Tanvir Hossain',
    batch: 'Class of 2021',
    role: 'Staff Platform Engineer',
    company: 'bKash Limited',
    category: 'FinTech',
    readTime: '4 min read',
    excerpt: 'Navigating mission-critical distributed systems, high-throughput message brokers, and why young graduates should prioritize fundamental data structures.',
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
    excerpt: 'Translating academic biomedical research into clinically certified diagnosis models, and establishing collaboration programs with current undergraduate researchers.',
    date: 'Sep 21, 2026',
  },
  {
    id: 'founding-a-logistics-scaleup',
    title: 'Zero to One: Solving Supply Chain Friction with Modern Web Stacks',
    alumnus: 'Monirul Islam',
    batch: 'Class of 2020',
    role: 'Co-founder & CTO',
    company: 'RapidRoute Logistics',
    category: 'Entrepreneurship',
    readTime: '5 min read',
    excerpt: 'From winning the campus hackathon to raising seed venture capital: practical lessons on bootstrapping a software startup in Bangladesh.',
    date: 'Sep 09, 2026',
  },
];

export default function StoriesPage() {
  return (
    <section className="page-shell" style={{ padding: '4rem 0' }}>
      <p className="eyebrow eyebrow--red">ALUMNI SPOTLIGHTS & SUCCESS STORIES</p>
      <h1>Footprints of Excellence.</h1>
      <p className="lede">
        Inspiring career journeys, entrepreneurial ventures, and technological innovations pioneered by our distinguished graduates worldwide.
      </p>

      {/* Featured Cover Story */}
      <div
        style={{
          margin: '3rem 0 4rem',
          border: '3px solid var(--ink)',
          background: 'var(--paper)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        }}
      >
        <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <Badge variant="error">Featured Spotlight</Badge>
              <Badge variant="neutral">{STORIES[0].category}</Badge>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', marginBottom: '1rem', lineHeight: 1.15 }}>
              {STORIES[0].title}
            </h2>
            <p className="lede" style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>
              {STORIES[0].excerpt}
            </p>
          </div>
          <div>
            <p style={{ fontWeight: 700, margin: 0 }}>
              {STORIES[0].alumnus} · <span style={{ color: 'var(--muted)', fontWeight: 400 }}>{STORIES[0].role} at {STORIES[0].company}</span>
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--quiet)', margin: '0.25rem 0 1.5rem' }}>
              {STORIES[0].batch} · {STORIES[0].readTime}
            </p>
            <Button asChild size="md">
              <Link href={`/alumni`}>
                Connect with {STORIES[0].alumnus.split(' ')[0]} <ArrowUpRight size={16} />
              </Link>
            </Button>
          </div>
        </div>

        <div
          style={{
            background: 'var(--ink)',
            color: 'var(--paper)',
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderLeft: '2px solid var(--ink)',
          }}
        >
          <span style={{ fontSize: '4rem', color: 'var(--red)', lineHeight: 1 }}>“</span>
          <p style={{ fontFamily: 'var(--display)', fontSize: '1.5rem', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
            The best university networks do not measure prestige by gates or walls—they measure it by how far the previous class reaches back to pull the next class forward.
          </p>
          <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#a3a3a3', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            — {STORIES[0].alumnus}, {STORIES[0].batch}
          </p>
        </div>
      </div>

      {/* Stories Grid */}
      <SectionHeading eyebrow="RECENT SPOTLIGHTS" title="Stories from across classes and industries." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        {STORIES.slice(1).map((story) => (
          <article
            key={story.id}
            style={{
              border: '2px solid var(--ink)',
              padding: '1.5rem',
              background: 'var(--paper)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <Badge variant="neutral">{story.category}</Badge>
                <span style={{ fontSize: '0.75rem', color: 'var(--quiet)' }}>{story.readTime}</span>
              </div>
              <h3 style={{ fontSize: '1.35rem', margin: '0.5rem 0' }}>{story.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                {story.excerpt}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '1rem', marginTop: '1rem' }}>
              <p style={{ fontWeight: 700, margin: 0, fontSize: '0.9rem' }}>{story.alumnus}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '0.2rem 0' }}>
                {story.role} · {story.company}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--quiet)', margin: 0 }}>
                {story.batch} · Published {story.date}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* Callout Banner */}
      <div
        style={{
          marginTop: '4rem',
          padding: '2.5rem',
          border: '2px solid var(--ink)',
          background: 'var(--surface)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <p className="eyebrow">SHARE YOUR JOURNEY</p>
          <h2 style={{ margin: 0 }}>Have an alumni story to tell?</h2>
          <p style={{ color: 'var(--muted)', margin: '0.5rem 0 0', maxWidth: '580px' }}>
            Inspire current undergraduates and fellow graduates with your career milestones, startup founding experiences, or research accomplishments.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/register">Submit Alumni Story</Link>
        </Button>
      </div>
    </section>
  );
}
