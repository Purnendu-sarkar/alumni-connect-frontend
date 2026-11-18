'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpRight,
  BookOpen,
  Clock,
  Search,
  Sparkles,
  User as UserIcon,
  RefreshCw,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionHeading } from '@/components/ui/section-heading';
import { EmptyState } from '@/components/dashboard/empty-state';
import { getStories } from '@/lib/api/stories.api';
import type { StoryCard as StoryCardType, StoryCategory } from '@/types/domain';
import { StoryCard, STORY_CATEGORY_LABELS, STORY_CATEGORY_COLORS } from '@/components/stories/story-card';
import { cn } from '@/lib/utils/cn';

const CATEGORY_TABS: Array<{ value: StoryCategory | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All Spotlights' },
  { value: 'CAREER_MILESTONE', label: 'Career Milestone' },
  { value: 'STARTUP_JOURNEY', label: 'Startup Journey' },
  { value: 'RESEARCH_BREAKTHROUGH', label: 'Research' },
  { value: 'COMMUNITY_IMPACT', label: 'Community' },
  { value: 'GLOBAL_EXPERIENCE', label: 'Global' },
  { value: 'CREATIVE_PURSUIT', label: 'Creative' },
  { value: 'GENERAL_INSIGHT', label: 'Insights' },
];

export default function StoriesPage() {
  const [category, setCategory] = useState<StoryCategory | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['public-stories', category, debouncedSearch],
    queryFn: () =>
      getStories({
        category: category !== 'ALL' ? category : undefined,
        q: debouncedSearch || undefined,
        limit: 20,
      }),
  });

  const stories: StoryCardType[] = responseData?.data || [];
  const featured = stories[0];
  const restStories = stories.slice(1);

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

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search stories by topic, title, or author…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {isFetching && !isLoading && (
              <span className="text-xs text-slate-400 animate-pulse">Updating...</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              title="Refresh stories"
              className="text-xs text-slate-600"
            >
              <RefreshCw size={14} className={cn(isFetching && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = category === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setCategory(tab.value)}
                className={cn(
                  'whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all',
                  isSelected
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-8">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      ) : isError ? (
        <EmptyState
          icon={BookOpen}
          title="Could not load alumni spotlights"
          description="We encountered an issue connecting to the stories service. Please try again."
          action={
            <Button size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : stories.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No stories found"
          description={
            debouncedSearch || category !== 'ALL'
              ? 'Try adjusting your search terms or selecting a different category filter.'
              : 'Our alumni are currently preparing new inspiring journeys. Check back soon!'
          }
        />
      ) : (
        <>
          {/* Featured Spotlight Card */}
          {featured && !debouncedSearch && category === 'ALL' && (
            <Card className="p-0 overflow-hidden shadow-md grid grid-cols-1 lg:grid-cols-12 border-slate-200 rounded-2xl bg-white">
              <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      Featured Spotlight
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {STORY_CATEGORY_LABELS[featured.category]}
                    </span>
                  </div>

                  <Link href={`/stories/${featured.slug || featured.id}`}>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug hover:text-blue-600 transition-colors">
                      {featured.title}
                    </h2>
                  </Link>

                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {featured.summary}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-200">
                      {featured.author?.avatarUrl ? (
                        <Image
                          src={featured.author.avatarUrl}
                          alt={featured.author.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-blue-100 text-blue-700 text-sm font-bold">
                          {featured.author?.name ? featured.author.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 m-0">
                        {featured.author?.name || 'Alumnus'}
                      </p>
                      <p className="text-xs text-slate-500 m-0 mt-0.5">
                        {[
                          featured.author?.currentRole,
                          featured.author?.department,
                          featured.author?.graduationYear ? `Class of ${featured.author.graduationYear}` : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                  </div>

                  <Button asChild size="sm">
                    <Link
                      href={`/stories/${featured.slug || featured.id}`}
                      className="inline-flex items-center gap-1 font-bold"
                    >
                      Read Full Story <ArrowUpRight size={14} />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Cover Image or Gradient Panel */}
              <div className="lg:col-span-5 relative aspect-[16/9] lg:aspect-auto min-h-[260px] bg-slate-900 overflow-hidden border-t lg:border-t-0 lg:border-l border-slate-200">
                {featured.coverImageUrl ? (
                  <Image
                    src={featured.coverImageUrl}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 500px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8 text-white text-center">
                    <Sparkles className="h-12 w-12 text-blue-400 mb-3" />
                    <p className="text-base font-bold">First-Person Alumni Journey</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      {featured.readingTimeMinutes} min read on career breakthroughs and engineering foundations
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Grid of Stories */}
          <div className="space-y-6">
            <SectionHeading
              title={
                debouncedSearch || category !== 'ALL'
                  ? 'Matching Stories'
                  : 'More Alumni Journeys & Insights'
              }
              description="Explore inspiring stories curated from graduates across diverse engineering and business disciplines."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(debouncedSearch || category !== 'ALL' ? stories : restStories).map(
                (story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    href={`/stories/${story.slug || story.id}`}
                  />
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
