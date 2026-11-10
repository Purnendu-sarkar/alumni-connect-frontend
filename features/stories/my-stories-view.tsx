'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Clock, PenSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { demoStories, type StoryRecord } from '@/features/shared/demo-data';
import type { UserRole } from '@/types/domain';

interface MyStoriesViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function MyStoriesView({ currentRole, basePath }: MyStoriesViewProps) {
  const [stories, setStories] = useState<StoryRecord[]>(demoStories.slice(0, 2));

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`${basePath}/stories`}
        backLabel="Back to All Stories"
        eyebrow="YOUR CONTRIBUTIONS"
        title="My Submitted Stories"
        description="Track the editorial review status and audience reach of your published career insights."
        actions={
          <Button asChild size="sm">
            <Link href={`${basePath}/stories/create`}>
              <Plus size={14} /> Write New Story
            </Link>
          </Button>
        }
      />

      {stories.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No stories submitted yet"
          description="Inspire the next generation by writing about your career experiences."
          action={
            <Button size="sm" asChild>
              <Link href={`${basePath}/stories/create`}>Write Your First Story</Link>
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
          {stories.map((story) => (
            <div
              key={story.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-slate-900 m-0">{story.title}</h3>
                  <StatusBadge status={story.status} />
                </div>
                <p className="text-xs text-slate-500 m-0">
                  {story.category} · {story.date} · {story.readingTime}
                </p>
                <p className="text-xs text-slate-600 line-clamp-1 mt-1.5 m-0">
                  {story.summary}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`${basePath}/stories/${story.id}`}>View Article</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
