'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  PenSquare,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';
import { demoStories, type StoryRecord } from '@/features/shared/demo-data';
import type { UserRole } from '@/types/domain';

interface StoriesListViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function StoriesListView({ currentRole, basePath }: StoriesListViewProps) {
  const [stories, setStories] = useState<StoryRecord[]>(demoStories);
  const [search, setSearch] = useState('');

  const filtered = stories.filter((story) => {
    const term = search.toLowerCase();
    const haystack = [story.title, story.author, story.authorCompany, story.summary, story.category].join(' ').toLowerCase();
    return !term || haystack.includes(term);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="INSPIRATION & COMMUNITY JOURNEYS"
        title="Alumni Success Stories"
        description="First-person career reflections, engineering triumphs, and entrepreneurial journeys from university alumni."
        actions={
          <div className="flex items-center gap-2">
            {currentRole === 'ALUMNI' ? (
              <>
                <Button asChild variant="secondary" size="sm">
                  <Link href={`${basePath}/stories/my-stories`}>My Submitted Stories</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`${basePath}/stories/create`}>
                    <PenSquare size={14} /> Write a Story
                  </Link>
                </Button>
              </>
            ) : null}
          </div>
        }
      />

      {/* Search */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs max-w-lg">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search stories by topic, author, company, or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Stories Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No stories found"
          description="Try searching with alternative keywords."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((story) => (
            <article
              key={story.id}
              className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-bold text-blue-600 tracking-wider uppercase text-[10px]">
                    {story.category}
                  </span>
                  <span>{story.readingTime}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 m-0 mb-2 hover:text-blue-600 transition-colors">
                  <Link href={`${basePath}/stories/${story.id}`}>
                    {story.title}
                  </Link>
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                  {story.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 m-0">{story.author}</p>
                  <p className="text-[11px] text-slate-500 m-0">
                    {story.authorRole} at {story.authorCompany}
                  </p>
                </div>

                <Button size="sm" variant="ghost" asChild>
                  <Link href={`${basePath}/stories/${story.id}`}>
                    Read Story
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
