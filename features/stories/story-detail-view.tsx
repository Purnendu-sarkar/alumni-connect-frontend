'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen, Calendar, Clock, Share2, Sparkles, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/page-header';
import { demoStories, type StoryRecord } from '@/features/shared/demo-data';
import type { UserRole } from '@/types/domain';

interface StoryDetailViewProps {
  id: string;
  currentRole: UserRole;
  basePath: string;
}

export function StoryDetailView({ id, currentRole, basePath }: StoryDetailViewProps) {
  const story: StoryRecord =
    demoStories.find((s) => s.id === id) || {
      id,
      title: 'Building Engineering Foundations That Last',
      author: 'Senior Alumnus',
      authorRole: 'Engineering Lead',
      authorDepartment: 'Computer Science & Engineering',
      authorBatch: 'Batch 2015',
      authorCompany: 'Tech Innovation Labs',
      date: 'October 2026',
      readingTime: '5 min read',
      category: 'CAREER MILESTONE',
      summary: 'Practical lessons on engineering discipline and continuous learning.',
      content:
        'When looking back at university days, the most valuable asset was not a specific syntax or API, but learning how to learn.\n\nTake time to master core computer science foundations: operating systems, network protocols, concurrency, and database internals. These remain relevant across decades.',
      status: 'PUBLISHED',
    };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        backHref={`${basePath}/stories`}
        backLabel="Back to Stories"
        eyebrow={story.category}
        title={story.title}
        description={`By ${story.author} (${story.authorRole} at ${story.authorCompany}) · Published ${story.date} · ${story.readingTime}`}
      />

      <article className="p-8 bg-white rounded-xl border border-slate-200 shadow-xs space-y-6">
        <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-blue-600 text-xs italic text-slate-700 leading-relaxed">
          &quot;{story.summary}&quot;
        </div>

        <div className="prose max-w-none text-slate-800 leading-relaxed text-sm whitespace-pre-line space-y-4">
          {story.content}
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            <p className="font-bold text-slate-900 m-0">{story.author}</p>
            <p className="m-0 mt-0.5">{story.authorDepartment} · {story.authorBatch}</p>
          </div>
          <Button size="sm" variant="ghost" asChild>
            <Link href={`${basePath}/directory`}>Find More Alumni</Link>
          </Button>
        </div>
      </article>
    </div>
  );
}
