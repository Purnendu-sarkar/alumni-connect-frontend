'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Check,
  Eye,
  Trash2,
  AlertCircle,
  RefreshCw,
  Search,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { useAuthStore } from '@/store/auth-store';
import {
  getAdminStories,
  getAdminStoryById,
  overrideStoryAdmin,
  deleteStoryAdmin,
} from '@/lib/api/stories.api';
import type { StoryStatus } from '@/types/domain';
import { StoryReader } from '@/components/stories/story-reader';
import { STORY_CATEGORY_LABELS, STORY_CATEGORY_COLORS } from '@/components/stories/story-card';
import { cn } from '@/lib/utils/cn';

const ALL_STATUSES: Array<StoryStatus | 'ALL'> = [
  'ALL',
  'SUBMITTED',
  'UNDER_REVIEW',
  'PUBLISHED',
  'REJECTED',
  'UNPUBLISHED',
  'DRAFT',
];

export function AdminStoriesView() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<StoryStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [inspectStoryId, setInspectStoryId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Override dialog
  const [overrideStoryId, setOverrideStoryId] = useState<string | null>(null);
  const [overrideTargetStatus, setOverrideTargetStatus] = useState<StoryStatus>('PUBLISHED');
  const [overrideReason, setOverrideReason] = useState('');

  // Delete dialog
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data: stories = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['admin', 'stories', 'oversight', statusFilter, debouncedSearch],
    queryFn: async () => {
      const res = await getAdminStories(
        {
          status: statusFilter,
          q: debouncedSearch || undefined,
        },
        accessToken,
        'admin'
      );
      return res.data || [];
    },
  });

  const { data: inspectedStory } = useQuery({
    queryKey: ['admin', 'story', inspectStoryId],
    queryFn: async () => {
      const res = await getAdminStoryById(inspectStoryId!, accessToken, 'admin');
      return res.data;
    },
    enabled: Boolean(inspectStoryId),
  });

  const notify = (msg: string) => {
    setErrorMessage(null);
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  const notifyError = (err: unknown, fallback: string) => {
    setNotice(null);
    setErrorMessage(err instanceof Error ? err.message : fallback);
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'stories'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'story'] });
  };

  const overrideMutation = useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: StoryStatus;
      reason: string;
    }) => overrideStoryAdmin(id, { status, reason }, accessToken),
    onSuccess: () => {
      invalidate();
      setOverrideStoryId(null);
      setOverrideReason('');
      notify('Story status successfully overridden by administrator.');
    },
    onError: (err) => notifyError(err, 'Failed to apply administrative override.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStoryAdmin(id, accessToken),
    onSuccess: () => {
      invalidate();
      setDeleteConfirmId(null);
      if (inspectStoryId) setInspectStoryId(null);
      notify('Story successfully removed by administrator.');
    },
    onError: (err) => {
      setDeleteConfirmId(null);
      notifyError(err, 'Failed to delete story.');
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="INSTITUTIONAL CONTENT OVERSIGHT"
        title="Success Stories Administration"
        description="Comprehensive repository oversight, editorial audits, and administrative governance of alumni stories."
      />

      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search stories by title, author, or keyword…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
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

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2">
        {ALL_STATUSES.map((status) => {
          const isSelected = statusFilter === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={cn(
                'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                isSelected
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              {status === 'ALL' ? 'All Stories' : status.replace('_', ' ')}
            </button>
          );
        })}
      </div>

      {/* Main List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse space-y-3"
            >
              <div className="h-4 w-1/4 bg-slate-100 rounded-sm" />
              <div className="h-5 w-1/2 bg-slate-100 rounded-sm" />
              <div className="h-3 w-3/4 bg-slate-100 rounded-sm" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
          <p className="text-sm font-semibold text-rose-800">
            Failed to load stories oversight list.
          </p>
          <Button size="sm" variant="secondary" onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      ) : stories.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No stories found"
          description="There are no stories matching the current filter criteria."
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
          {stories.map((story) => {
            const catColors =
              STORY_CATEGORY_COLORS[story.category] || STORY_CATEGORY_COLORS.GENERAL_INSIGHT;
            return (
              <div
                key={story.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                        catColors.badge
                      )}
                    >
                      <span className={cn('h-1.5 w-1.5 rounded-full', catColors.dot)} />
                      {STORY_CATEGORY_LABELS[story.category] || story.category}
                    </span>
                    <StatusBadge status={story.status} />

                    {story.reviewer && (
                      <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        Reviewer: {story.reviewer.name}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 truncate">{story.title}</h4>
                  <p className="text-xs text-slate-500">
                    By {story.author?.name || 'Alumnus'}
                    {story.author?.department ? ` · ${story.author.department}` : ''}
                    {story.author?.graduationYear || story.author?.batch
                      ? ` · Class of ${story.author.graduationYear || story.author.batch}`
                      : ''}
                    {` · ${story.readingTimeMinutes} min read`}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setInspectStoryId(story.id)}
                  >
                    <Eye size={14} className="mr-1.5" /> Inspect
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setOverrideStoryId(story.id);
                      setOverrideTargetStatus(story.status);
                    }}
                  >
                    <SlidersHorizontal size={14} className="mr-1.5" /> Override
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteConfirmId(story.id)}
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspector Modal */}
      {inspectStoryId && inspectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative my-8 w-full max-w-4xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 pb-4 backdrop-blur-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Administrative Story Inspection
                </span>
                <StatusBadge status={inspectedStory.status} />
              </div>
              <button
                type="button"
                onClick={() => setInspectStoryId(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-6">
              <StoryReader
                story={inspectedStory}
                backLabel="Close Inspection"
                onBackClick={() => setInspectStoryId(null)}
                authorProfileHref={
                  inspectedStory.author?.id ? `/admin/users/${inspectedStory.author.id}` : null
                }
                showEditorialInfo
              />
            </div>

            <div className="sticky bottom-0 z-30 flex items-center justify-between border-t border-slate-200 bg-white/95 pt-4 backdrop-blur-xs">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setInspectStoryId(null)}
              >
                Close Preview
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setOverrideStoryId(inspectedStory.id);
                    setOverrideTargetStatus(inspectedStory.status);
                  }}
                >
                  <SlidersHorizontal size={14} className="mr-1.5" /> Administrative Override
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Override Modal */}
      {overrideStoryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Administrative Status Override</h3>
            <p className="text-xs text-slate-600">
              Directly transition this story to any status. This action is recorded in the platform security audit logs.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Status *
                </label>
                <select
                  value={overrideTargetStatus}
                  onChange={(e) => setOverrideTargetStatus(e.target.value as StoryStatus)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="UNPUBLISHED">UNPUBLISHED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Override * (min 5 characters)
                </label>
                <textarea
                  rows={3}
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Administrative override to publish after dean approval"
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setOverrideStoryId(null);
                  setOverrideReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={overrideReason.trim().length < 5 || overrideMutation.isPending}
                onClick={() =>
                  overrideMutation.mutate({
                    id: overrideStoryId,
                    status: overrideTargetStatus,
                    reason: overrideReason.trim(),
                  })
                }
              >
                {overrideMutation.isPending ? 'Applying...' : 'Apply Override'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Delete Story (Admin)</h3>
            <p className="text-xs text-slate-600">
              Permanently mark this story as deleted. This removes it from all feeds and audit queues.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
