'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Check,
  CheckCircle2,
  FileCheck2,
  HelpCircle,
  Megaphone,
  Sparkles,
  X,
  Eye,
  RotateCcw,
  AlertCircle,
  Clock,
  User,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Archive,
  MessageSquare,
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
  claimStory,
  unclaimStory,
  approveStory,
  rejectStory,
  requestStoryChanges,
  unpublishStoryAdmin,
  restoreStoryAdmin,
} from '@/lib/api/stories.api';
import type { UserRole, AdminStoryDetail, StoryStatus } from '@/types/domain';
import { StoryReader } from '@/components/stories/story-reader';
import { STORY_CATEGORY_LABELS, STORY_CATEGORY_COLORS } from '@/components/stories/story-card';
import { cn } from '@/lib/utils/cn';

interface ModeratorContentViewProps {
  currentRole: UserRole;
  basePath: string;
  pendingOnly?: boolean;
}

type ModerationFilterTab = 'QUEUE' | 'ALL' | 'PUBLISHED' | 'REJECTED';

export function ModeratorContentView({
  currentRole,
  basePath,
  pendingOnly = false,
}: ModeratorContentViewProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<ModerationFilterTab>('QUEUE');
  const [inspectStoryId, setInspectStoryId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Modal dialog states
  const [rejectDialogStoryId, setRejectDialogStoryId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectInternalNote, setRejectInternalNote] = useState('');

  const [revisionDialogStoryId, setRevisionDialogStoryId] = useState<string | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [revisionInternalNote, setRevisionInternalNote] = useState('');

  const roleScope = currentRole === 'SUPER_ADMIN' ? 'admin' : 'moderator';

  // Live Query for stories queue
  const {
    data: stories = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [roleScope, 'stories', 'moderation-list', activeTab],
    queryFn: async () => {
      let statusFilter: StoryStatus | 'ALL' | undefined;
      if (activeTab === 'QUEUE') statusFilter = undefined; // backend defaults to review queue
      else if (activeTab === 'PUBLISHED') statusFilter = 'PUBLISHED';
      else if (activeTab === 'REJECTED') statusFilter = 'REJECTED';
      else statusFilter = 'ALL';

      const res = await getAdminStories(
        {
          status: statusFilter,
        },
        accessToken,
        roleScope
      );
      return res.data || [];
    },
  });

  // Query for story inspection detail if inspectStoryId is set
  const { data: inspectedStory } = useQuery({
    queryKey: [roleScope, 'story', 'detail', inspectStoryId],
    queryFn: async () => {
      const res = await getAdminStoryById(inspectStoryId!, accessToken, roleScope);
      return res.data;
    },
    enabled: Boolean(inspectStoryId),
  });

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [roleScope, 'stories'] });
    queryClient.invalidateQueries({ queryKey: [roleScope, 'story'] });
  };

  // Mutations
  const claimMutation = useMutation({
    mutationFn: (id: string) => claimStory(id, accessToken, roleScope),
    onSuccess: () => {
      invalidate();
      notify('Story successfully assigned to your editorial review queue.');
    },
  });

  const unclaimMutation = useMutation({
    mutationFn: (id: string) => unclaimStory(id, accessToken, roleScope),
    onSuccess: () => {
      invalidate();
      notify('Story released back to unassigned queue.');
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveStory(id, accessToken, roleScope),
    onSuccess: () => {
      invalidate();
      if (inspectStoryId) setInspectStoryId(null);
      notify('Story approved and published to the campus stories feed.');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({
      id,
      reasonCode,
      internalNote,
    }: {
      id: string;
      reasonCode: string;
      internalNote?: string;
    }) => rejectStory(id, { reasonCode, internalNote }, accessToken, roleScope),
    onSuccess: () => {
      invalidate();
      setRejectDialogStoryId(null);
      setRejectReason('');
      setRejectInternalNote('');
      if (inspectStoryId) setInspectStoryId(null);
      notify('Story rejected with editorial feedback delivered to author.');
    },
  });

  const requestChangesMutation = useMutation({
    mutationFn: ({
      id,
      notes,
      internalNote,
    }: {
      id: string;
      notes: string;
      internalNote?: string;
    }) => requestStoryChanges(id, { notes, internalNote }, accessToken, roleScope),
    onSuccess: () => {
      invalidate();
      setRevisionDialogStoryId(null);
      setRevisionNotes('');
      setRevisionInternalNote('');
      if (inspectStoryId) setInspectStoryId(null);
      notify('Revision feedback sent to author. Story reverted to draft.');
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: ({ id, reasonCode }: { id: string; reasonCode: string }) =>
      unpublishStoryAdmin(id, { reasonCode }, accessToken, roleScope),
    onSuccess: () => {
      invalidate();
      notify('Story unpublished from public campus feed.');
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => restoreStoryAdmin(id, accessToken, roleScope),
    onSuccess: () => {
      invalidate();
      notify('Story restored to published status.');
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CAMPUS EDITORIAL DESK"
        title="Content Moderation Desk"
        description="Review, verify, and moderate alumni success stories and personal narratives before campus publication."
      />

      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('QUEUE')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
            activeTab === 'QUEUE'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          )}
        >
          Editorial Queue (Pending Review)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
            activeTab === 'ALL'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          )}
        >
          All Stories
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('PUBLISHED')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
            activeTab === 'PUBLISHED'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          )}
        >
          Published
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('REJECTED')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
            activeTab === 'REJECTED'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          )}
        >
          Revisions & Rejections
        </button>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            title="Refresh queue"
            className="text-slate-600"
          >
            <RefreshCw size={14} className={cn(isFetching && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Main List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white p-6 animate-pulse space-y-4"
            >
              <div className="h-4 w-1/4 bg-slate-100 rounded-sm" />
              <div className="h-6 w-1/2 bg-slate-100 rounded-sm" />
              <div className="h-3 w-3/4 bg-slate-100 rounded-sm" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
          <p className="text-sm font-semibold text-rose-800">
            Failed to load moderation queue.
          </p>
          <Button size="sm" variant="secondary" onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      ) : stories.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No Content Pending Review"
          description="All alumni stories and articles have been reviewed and processed."
        />
      ) : (
        <div className="space-y-4">
          {stories.map((story) => {
            const catColors =
              STORY_CATEGORY_COLORS[story.category] || STORY_CATEGORY_COLORS.GENERAL_INSIGHT;
            const isAssignedToMe = story.reviewerId === currentUser?.id;
            const isUnassigned = !story.reviewerId;

            return (
              <div
                key={story.id}
                className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
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

                      {story.reviewer ? (
                        <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700 border border-purple-200">
                          Reviewer: {story.reviewer.name}
                        </span>
                      ) : (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          Unassigned
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-1">{story.title}</h3>
                    <p className="text-xs text-slate-500">
                      By {story.author?.name || 'Alumnus'} · {story.author?.department} · Class of{' '}
                      {story.author?.graduationYear || story.author?.batch} · {story.readingTimeMinutes} min read
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-start">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setInspectStoryId(story.id)}
                    >
                      <Eye size={14} className="mr-1.5" /> Inspect & Read
                    </Button>

                    {/* Claim / Unclaim */}
                    {isUnassigned &&
                      (story.status === 'SUBMITTED' || story.status === 'UNDER_REVIEW') && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => claimMutation.mutate(story.id)}
                          disabled={claimMutation.isPending}
                        >
                          Claim Review
                        </Button>
                      )}

                    {isAssignedToMe && story.status === 'UNDER_REVIEW' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => unclaimMutation.mutate(story.id)}
                        disabled={unclaimMutation.isPending}
                        className="text-slate-600"
                      >
                        Unclaim
                      </Button>
                    )}

                    {/* Approve */}
                    {(story.status === 'SUBMITTED' || story.status === 'UNDER_REVIEW') && (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => approveMutation.mutate(story.id)}
                        disabled={approveMutation.isPending}
                      >
                        <Check size={14} className="mr-1.5" /> Approve & Publish
                      </Button>
                    )}

                    {/* Request Changes */}
                    {(story.status === 'SUBMITTED' || story.status === 'UNDER_REVIEW') && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setRevisionDialogStoryId(story.id)}
                        className="text-amber-700 border-amber-200 hover:bg-amber-50"
                      >
                        <MessageSquare size={14} className="mr-1.5" /> Request Revisions
                      </Button>
                    )}

                    {/* Reject */}
                    {(story.status === 'SUBMITTED' || story.status === 'UNDER_REVIEW') && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setRejectDialogStoryId(story.id)}
                        className="text-rose-700 border-rose-200 hover:bg-rose-50"
                      >
                        <X size={14} className="mr-1.5" /> Reject
                      </Button>
                    )}

                    {/* Unpublish if published */}
                    {story.status === 'PUBLISHED' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          unpublishMutation.mutate({
                            id: story.id,
                            reasonCode: 'Editorial standard review',
                          })
                        }
                        className="text-slate-600"
                      >
                        <Archive size={14} className="mr-1.5" /> Unpublish
                      </Button>
                    )}

                    {/* Restore if unpublished */}
                    {story.status === 'UNPUBLISHED' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => restoreMutation.mutate(story.id)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <RotateCcw size={14} className="mr-1.5" /> Restore
                      </Button>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50/80 rounded-lg p-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {story.summary}
                </div>

                {/* Internal / Owner Notes if present */}
                {(story.ownerVisibleNote || story.internalAdminNote) && (
                  <div className="rounded-lg bg-amber-50/60 border border-amber-200 p-2.5 text-xs text-amber-900 space-y-1">
                    {story.ownerVisibleNote && (
                      <p>
                        <span className="font-semibold">Author Feedback:</span> {story.ownerVisibleNote}
                      </p>
                    )}
                    {story.internalAdminNote && (
                      <p className="text-slate-600">
                        <span className="font-semibold text-slate-700">Internal Staff Note:</span>{' '}
                        {story.internalAdminNote}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Full-Screen Story Inspection Modal */}
      {inspectStoryId && inspectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative my-8 w-full max-w-4xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 pb-4 backdrop-blur-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Story Editorial Inspection
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
                backHref="#"
                showEditorialInfo
              />
            </div>

            {/* Quick Action Footer */}
            <div className="sticky bottom-0 z-30 flex items-center justify-between border-t border-slate-200 bg-white/95 pt-4 backdrop-blur-xs">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setInspectStoryId(null)}
              >
                Close Preview
              </Button>

              <div className="flex items-center gap-2">
                {(inspectedStory.status === 'SUBMITTED' ||
                  inspectedStory.status === 'UNDER_REVIEW') && (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setRevisionDialogStoryId(inspectedStory.id);
                      }}
                      className="text-amber-700 border-amber-200"
                    >
                      Request Revisions
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setRejectDialogStoryId(inspectedStory.id);
                      }}
                      className="text-rose-700 border-rose-200"
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => approveMutation.mutate(inspectedStory.id)}
                    >
                      <Check size={14} className="mr-1.5" /> Approve & Publish
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectDialogStoryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Reject Story Submission</h3>
            <p className="text-xs text-slate-600">
              Provide a clear, professional reason for rejection. This feedback is delivered directly to the alumnus.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason to Author *
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. This story contains commercial promotional links not permitted under our institutional editorial policy."
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internal Staff Note (Optional)
                </label>
                <input
                  type="text"
                  value={rejectInternalNote}
                  onChange={(e) => setRejectInternalNote(e.target.value)}
                  placeholder="Private note for moderation team records"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-slate-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setRejectDialogStoryId(null);
                  setRejectReason('');
                  setRejectInternalNote('');
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                onClick={() =>
                  rejectMutation.mutate({
                    id: rejectDialogStoryId,
                    reasonCode: rejectReason.trim(),
                    internalNote: rejectInternalNote.trim() || undefined,
                  })
                }
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Request Changes Modal */}
      {revisionDialogStoryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Request Revisions from Author</h3>
            <p className="text-xs text-slate-600">
              The story will be returned to the alumnus as a draft with your revision guidance.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Requested Changes / Editorial Notes *
                </label>
                <textarea
                  rows={4}
                  required
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="e.g. Please expand on your engineering decisions during the payment latency issue in section 2, and verify that all team member names are credited."
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internal Staff Note (Optional)
                </label>
                <input
                  type="text"
                  value={revisionInternalNote}
                  onChange={(e) => setRevisionInternalNote(e.target.value)}
                  placeholder="Private note for moderation audit logs"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-slate-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setRevisionDialogStoryId(null);
                  setRevisionNotes('');
                  setRevisionInternalNote('');
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white"
                disabled={!revisionNotes.trim() || requestChangesMutation.isPending}
                onClick={() =>
                  requestChangesMutation.mutate({
                    id: revisionDialogStoryId,
                    notes: revisionNotes.trim(),
                    internalNote: revisionInternalNote.trim() || undefined,
                  })
                }
              >
                {requestChangesMutation.isPending ? 'Sending...' : 'Send Revision Feedback'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
