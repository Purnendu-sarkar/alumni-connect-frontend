'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  Edit,
  PenSquare,
  Plus,
  Trash2,
  AlertCircle,
  Eye,
  Send,
  RotateCcw,
  RefreshCw,
  Archive,
  CheckCircle2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { useAuthStore } from '@/store/auth-store';
import {
  getMyStories,
  submitStory,
  withdrawStory,
  unpublishStory,
  deleteStory,
} from '@/lib/api/stories.api';
import type { UserRole, StoryStatus, AuthorStoryDetail } from '@/types/domain';
import { STORY_CATEGORY_LABELS, STORY_CATEGORY_COLORS } from '@/components/stories/story-card';
import { cn } from '@/lib/utils/cn';

interface MyStoriesViewProps {
  currentRole: UserRole;
  basePath: string;
}

type TabKey = 'ALL' | 'DRAFTS' | 'REVIEW' | 'PUBLISHED' | 'CHANGES';

export function MyStoriesView({ currentRole, basePath }: MyStoriesViewProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Modal confirm states
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmWithdrawId, setConfirmWithdrawId] = useState<string | null>(null);
  const [confirmUnpublishId, setConfirmUnpublishId] = useState<string | null>(null);

  const {
    data: allStories = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['my-stories', 'all'],
    queryFn: async () => {
      const res = await getMyStories('ALL', 1, 50, accessToken);
      return res.data || [];
    },
  });

  const notifySuccess = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  // Mutations
  const submitMutation = useMutation({
    mutationFn: (id: string) => submitStory(id, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-stories'] });
      notifySuccess('Story submitted successfully for editorial review.');
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: (id: string) => withdrawStory(id, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-stories'] });
      setConfirmWithdrawId(null);
      notifySuccess('Story withdrawn back to drafts.');
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => unpublishStory(id, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-stories'] });
      setConfirmUnpublishId(null);
      notifySuccess('Story unpublished and returned to private drafts.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStory(id, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-stories'] });
      setConfirmDeleteId(null);
      notifySuccess('Draft deleted.');
    },
  });

  // Filter stories based on activeTab
  const filteredStories = allStories.filter((s) => {
    if (activeTab === 'DRAFTS') return s.status === 'DRAFT';
    if (activeTab === 'REVIEW')
      return s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW';
    if (activeTab === 'PUBLISHED')
      return s.status === 'PUBLISHED' || s.status === 'APPROVED';
    if (activeTab === 'CHANGES')
      return s.status === 'REJECTED' || s.status === 'UNPUBLISHED';
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`${basePath}/stories`}
        backLabel="Back to All Stories"
        eyebrow="YOUR EDITORIAL PORTFOLIO"
        title="My Submitted Stories"
        description="Track the review progress, manage drafts, and view audience reach of your published stories."
        actions={
          <Button asChild size="sm">
            <Link href={`${basePath}/stories/create`}>
              <Plus size={14} className="mr-1.5" /> Write New Story
            </Link>
          </Button>
        }
      />

      {actionSuccessMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        {(
          [
            { id: 'ALL', label: 'All Stories', count: allStories.length },
            {
              id: 'DRAFTS',
              label: 'Drafts',
              count: allStories.filter((s) => s.status === 'DRAFT').length,
            },
            {
              id: 'REVIEW',
              label: 'Under Review',
              count: allStories.filter(
                (s) => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW'
              ).length,
            },
            {
              id: 'PUBLISHED',
              label: 'Published',
              count: allStories.filter(
                (s) => s.status === 'PUBLISHED' || s.status === 'APPROVED'
              ).length,
            },
            {
              id: 'CHANGES',
              label: 'Revisions & Feedback',
              count: allStories.filter(
                (s) => s.status === 'REJECTED' || s.status === 'UNPUBLISHED'
              ).length,
            },
          ] as const
        ).map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                isSelected
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.2 text-[10px]',
                  isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            title="Refresh"
            className="text-slate-600"
          >
            <RefreshCw size={14} className={cn(isFetching && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse space-y-3"
            >
              <div className="h-5 w-1/3 bg-slate-100 rounded-sm" />
              <div className="h-3 w-1/4 bg-slate-100 rounded-sm" />
              <div className="h-3 w-3/4 bg-slate-100 rounded-sm" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
          <p className="text-sm font-semibold text-rose-800">
            Failed to load your submitted stories.
          </p>
          <Button size="sm" variant="secondary" onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      ) : filteredStories.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No stories found in this section"
          description={
            activeTab === 'ALL'
              ? 'Inspire students and alumni by sharing your career journey or startup story.'
              : 'No stories currently match this review stage.'
          }
          action={
            <Button size="sm" asChild>
              <Link href={`${basePath}/stories/create`}>
                <Plus size={14} className="mr-1.5" /> Write Your Story
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
          {filteredStories.map((story) => {
            const catColors =
              STORY_CATEGORY_COLORS[story.category] || STORY_CATEGORY_COLORS.GENERAL_INSIGHT;
            return (
              <div key={story.id} className="p-6 transition-colors hover:bg-slate-50/50 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                          catColors.badge
                        )}
                      >
                        <span className={cn('h-1.5 w-1.5 rounded-full', catColors.dot)} />
                        {STORY_CATEGORY_LABELS[story.category]}
                      </span>
                      <StatusBadge status={story.status} />
                      <span className="text-xs text-slate-400">
                        {story.readingTimeMinutes} min read
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      <Link
                        href={`${basePath}/stories/${story.slug || story.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {story.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {story.summary}
                    </p>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`${basePath}/stories/${story.slug || story.id}`}>
                        <Eye size={14} className="mr-1.5" /> View
                      </Link>
                    </Button>

                    {/* Edit button */}
                    {(story.status === 'DRAFT' ||
                      story.status === 'REJECTED' ||
                      story.status === 'UNPUBLISHED' ||
                      story.status === 'PUBLISHED') && (
                      <Button asChild size="sm" variant="secondary">
                        <Link href={`${basePath}/stories/${story.id}/edit`}>
                          <Edit size={14} className="mr-1.5" /> Edit
                        </Link>
                      </Button>
                    )}

                    {/* Submit Draft for review */}
                    {story.status === 'DRAFT' && (
                      <Button
                        size="sm"
                        onClick={() => submitMutation.mutate(story.id)}
                        disabled={submitMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Send size={14} className="mr-1.5" /> Submit
                      </Button>
                    )}

                    {/* Withdraw if in review */}
                    {(story.status === 'SUBMITTED' || story.status === 'UNDER_REVIEW') && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setConfirmWithdrawId(story.id)}
                        className="text-amber-700 border-amber-200 hover:bg-amber-50"
                      >
                        <RotateCcw size={14} className="mr-1.5" /> Withdraw
                      </Button>
                    )}

                    {/* Unpublish if published */}
                    {story.status === 'PUBLISHED' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setConfirmUnpublishId(story.id)}
                        className="text-slate-600"
                      >
                        <Archive size={14} className="mr-1.5" /> Unpublish
                      </Button>
                    )}

                    {/* Delete if draft or rejected */}
                    {(story.status === 'DRAFT' || story.status === 'REJECTED') && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmDeleteId(story.id)}
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Editorial Feedback Banner if rejected or notes exist */}
                {story.ownerVisibleNote && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-950">Editorial Feedback: </span>
                        <span>{story.ownerVisibleNote}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal: Delete */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Delete Story Draft</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this story draft? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(confirmDeleteId)}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Draft'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Withdraw */}
      {confirmWithdrawId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Withdraw from Review</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Withdrawing returns this story to your private drafts so you can make edits before resubmitting.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmWithdrawId(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white"
                disabled={withdrawMutation.isPending}
                onClick={() => withdrawMutation.mutate(confirmWithdrawId)}
              >
                {withdrawMutation.isPending ? 'Withdrawing...' : 'Confirm Withdraw'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Unpublish */}
      {confirmUnpublishId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Unpublish Story</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              This will remove the story from the campus feed and revert it to private drafts. You can edit and resubmit anytime.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmUnpublishId(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-slate-800 hover:bg-slate-900 text-white"
                disabled={unpublishMutation.isPending}
                onClick={() => unpublishMutation.mutate(confirmUnpublishId)}
              >
                {unpublishMutation.isPending ? 'Unpublishing...' : 'Confirm Unpublish'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
