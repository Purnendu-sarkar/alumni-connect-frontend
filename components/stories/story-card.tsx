'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, BookOpen, User as UserIcon } from 'lucide-react';
import type { StoryCard as StoryCardType, StoryCategory } from '@/types/domain';
import { cn } from '@/lib/utils/cn';

export const STORY_CATEGORY_LABELS: Record<StoryCategory, string> = {
  CAREER_MILESTONE: 'Career Milestone',
  ENTREPRENEURSHIP: 'Entrepreneurship',
  TECH_INNOVATION: 'Tech & Innovation',
  RESEARCH_ACADEMIA: 'Research & Academia',
  DESIGN_PRODUCT: 'Design & Product',
  CAMPUS_NOSTALGIA: 'Campus Nostalgia',
  GENERAL_INSIGHT: 'General Insight',
};

export const STORY_CATEGORY_COLORS: Record<StoryCategory, { badge: string; dot: string }> = {
  CAREER_MILESTONE: {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  ENTREPRENEURSHIP: {
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
  },
  TECH_INNOVATION: {
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    dot: 'bg-cyan-500',
  },
  RESEARCH_ACADEMIA: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  DESIGN_PRODUCT: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  CAMPUS_NOSTALGIA: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  GENERAL_INSIGHT: {
    badge: 'bg-slate-50 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
  },
};

interface StoryCardProps {
  story: StoryCardType;
  href?: string;
  className?: string;
}

export function StoryCard({ story, href, className }: StoryCardProps) {
  const targetHref = href || `/stories/${story.slug || story.id}`;
  const categoryConfig = STORY_CATEGORY_COLORS[story.category] || STORY_CATEGORY_COLORS.GENERAL_INSIGHT;
  const categoryLabel = STORY_CATEGORY_LABELS[story.category] || story.category;

  const authorSubtitle = [
    story.author?.currentRole,
    story.author?.currentCompany,
  ]
    .filter(Boolean)
    .join(' at ') || [story.author?.department, story.author?.batch ? `Batch ${story.author?.batch}` : null]
    .filter(Boolean)
    .join(' • ');

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200',
        className
      )}
    >
      <Link href={targetHref} className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        {story.coverImageUrl ? (
          <Image
            src={story.coverImageUrl}
            alt={story.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-6 text-slate-400">
            <BookOpen className="h-10 w-10 text-slate-300" />
            <span className="mt-2 text-xs font-medium text-slate-400">Institutional Success Story</span>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm',
              categoryConfig.badge
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', categoryConfig.dot)} />
            {categoryLabel}
          </span>
        </div>

        <div className="absolute bottom-3 right-3 rounded-md bg-slate-900/70 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-xs">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {story.readingTimeMinutes || 3} min read
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={targetHref} className="group-hover:text-blue-600">
          <h3 className="line-clamp-2 text-lg font-bold tracking-tight text-slate-900 transition-colors">
            {story.title}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-2 text-sm text-slate-600 leading-relaxed">
          {story.summary}
        </p>

        {story.tags && story.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {story.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-slate-200">
              {story.author?.avatarUrl ? (
                <Image
                  src={story.author.avatarUrl}
                  alt={story.author.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-blue-100 text-blue-700 text-xs font-semibold">
                  {story.author?.name ? story.author.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900">
                {story.author?.name || 'Alumnus'}
              </p>
              {authorSubtitle && (
                <p className="truncate text-[11px] text-slate-500">
                  {authorSubtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
