'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  PenSquare,
  Search,
  RefreshCw,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';
import { useAuthStore } from '@/store/auth-store';
import { getStories } from '@/lib/api/stories.api';
import type { UserRole, StoryCategory } from '@/types/domain';
import { StoryCard } from '@/components/stories/story-card';
import { cn } from '@/lib/utils/cn';

interface StoriesListViewProps {
  currentRole: UserRole;
  basePath: string;
}

const CATEGORY_TABS: Array<{ value: StoryCategory | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All Stories' },
  { value: 'CAREER_MILESTONE', label: 'Career Milestone' },
  { value: 'ENTREPRENEURSHIP', label: 'Entrepreneurship' },
  { value: 'TECH_INNOVATION', label: 'Tech & Innovation' },
  { value: 'RESEARCH_ACADEMIA', label: 'Research & Academia' },
  { value: 'DESIGN_PRODUCT', label: 'Design & Product' },
  { value: 'CAMPUS_NOSTALGIA', label: 'Campus Nostalgia' },
  { value: 'GENERAL_INSIGHT', label: 'General Insight' },
];

export function StoriesListView({ currentRole, basePath }: StoriesListViewProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory | 'ALL'>('ALL');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);

  // 300ms search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
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
    queryKey: [
      currentRole.toLowerCase(),
      'stories',
      'list',
      debouncedSearch,
      selectedCategory,
      sort,
      page,
    ],
    queryFn: () =>
      getStories(
        {
          q: debouncedSearch || undefined,
          category: selectedCategory === 'ALL' ? undefined : selectedCategory,
          sort,
          page,
          limit: 12,
        },
        accessToken
      ),
  });

  const stories = responseData?.data || [];
  const meta = responseData?.meta;
  const totalPages = meta?.totalPages || 1;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="COMMUNITY INSPIRATION & EXPERIENCES"
        title="Alumni Success Stories"
        description="First-person career reflections, engineering triumphs, and startup journeys from university alumni."
        actions={
          <div className="flex items-center gap-2">
            {currentRole === 'ALUMNI' ? (
              <>
                <Button asChild variant="secondary" size="sm">
                  <Link href={`${basePath}/stories/my-stories`}>
                    <FolderOpen size={14} className="mr-1.5" />
                    My Submitted Stories
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`${basePath}/stories/create`}>
                    <PenSquare size={14} className="mr-1.5" />
                    Write a Story
                  </Link>
                </Button>
              </>
            ) : null}
          </div>
        }
      />

      {/* Search, Sort & Category Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search stories by topic, title, author, or keywords…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <select
              aria-label="Sort stories"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as 'newest' | 'oldest');
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

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
            const isSelected = selectedCategory === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setSelectedCategory(tab.value);
                  setPage(1);
                }}
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

      {/* Main Content States */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse space-y-4"
            >
              <div className="aspect-[16/9] w-full rounded-lg bg-slate-100" />
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-slate-100 rounded-sm" />
                <div className="h-3 w-full bg-slate-100 rounded-sm" />
                <div className="h-3 w-2/3 bg-slate-100 rounded-sm" />
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-100" />
                <div className="space-y-1 flex-1">
                  <div className="h-3 w-1/2 bg-slate-100 rounded-sm" />
                  <div className="h-2 w-1/3 bg-slate-100 rounded-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
          <p className="text-sm font-semibold text-rose-800">
            Failed to load stories from the campus repository.
          </p>
          <p className="mt-1 text-xs text-rose-600">
            Please check your network connection and try again.
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => refetch()}
            className="mt-4"
          >
            <RefreshCw size={14} className="mr-1.5" />
            Retry
          </Button>
        </div>
      ) : stories.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No stories found"
          description={
            debouncedSearch || selectedCategory !== 'ALL'
              ? 'Try modifying your search query or selecting a different category tab.'
              : 'Be the first alumnus to publish an inspiring journey or professional reflection.'
          }
          action={
            currentRole === 'ALUMNI' ? (
              <Button size="sm" asChild>
                <Link href={`${basePath}/stories/create`}>
                  <PenSquare size={14} className="mr-1.5" />
                  Write First Story
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                href={`${basePath}/stories/${story.slug || story.id}`}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <p className="text-xs text-slate-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={14} className="mr-1" /> Previous
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
