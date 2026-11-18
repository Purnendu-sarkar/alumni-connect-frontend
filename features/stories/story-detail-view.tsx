'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { getStoryById } from '@/lib/api/stories.api';
import type { UserRole } from '@/types/domain';
import { StoryReader } from '@/components/stories/story-reader';

interface StoryDetailViewProps {
  id: string;
  currentRole: UserRole;
  basePath: string;
}

export function StoryDetailView({ id, currentRole, basePath }: StoryDetailViewProps) {
  const accessToken = useAuthStore((state) => state.accessToken);

  const {
    data: story,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['story', id],
    queryFn: async () => {
      const res = await getStoryById(id, accessToken);
      return res.data;
    },
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 space-y-8 animate-pulse">
        <div className="h-4 w-32 bg-slate-200 rounded-sm" />
        <div className="h-6 w-24 bg-slate-200 rounded-full" />
        <div className="h-10 w-3/4 bg-slate-200 rounded-sm" />
        <div className="h-5 w-full bg-slate-200 rounded-sm" />
        <div className="flex items-center gap-4 py-4 border-y border-slate-200">
          <div className="h-12 w-12 rounded-full bg-slate-200" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-1/3 bg-slate-200 rounded-sm" />
            <div className="h-3 w-1/4 bg-slate-200 rounded-sm" />
          </div>
        </div>
        <div className="aspect-[16/9] w-full rounded-2xl bg-slate-200" />
        <div className="space-y-4">
          <div className="h-4 w-full bg-slate-200 rounded-sm" />
          <div className="h-4 w-full bg-slate-200 rounded-sm" />
          <div className="h-4 w-2/3 bg-slate-200 rounded-sm" />
        </div>
      </div>
    );
  }

  if (isError || !story) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Story Not Found</h3>
        <p className="mt-1 text-sm text-slate-500">
          The requested success story may have been unpublish, removed, or is currently under editorial review.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="secondary" size="sm">
            <Link href={`${basePath}/stories`}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to Stories
            </Link>
          </Button>
          <Button size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <StoryReader
      story={story}
      backHref={`${basePath}/stories`}
      backLabel="Back to Stories"
      showEditorialInfo={currentRole === 'SUPER_ADMIN' || currentRole === 'MODERATOR'}
    />
  );
}
