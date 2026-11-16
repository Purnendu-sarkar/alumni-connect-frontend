'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Megaphone,
  Plus,
  Search,
  Pin,
  Edit,
  Trash2,
  CheckCircle2,
  Archive,
  RotateCcw,
  Copy,
  Users,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { EmptyState } from '@/components/dashboard/empty-state';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getAdminAnnouncements,
  publishAnnouncement,
  archiveAnnouncement,
  restoreAnnouncement,
  togglePinAnnouncement,
  duplicateAnnouncement,
  deleteAnnouncement,
} from '@/lib/api/announcements.api';
import { formatDate } from '@/lib/utils/format';
import { useAuthStore } from '@/store/auth-store';
import type { AnnouncementDetail, AnnouncementStatus } from '@/types/domain';

export function AdminAnnouncementsView() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [statusFilter, setStatusFilter] = useState<'ALL' | AnnouncementStatus>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin-announcements', accessToken, statusFilter, search, page],
    queryFn: async () => {
      if (!accessToken) return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } };
      return getAdminAnnouncements(accessToken, {
        status: statusFilter,
        q: search.trim() || undefined,
        page,
        limit: 20,
      });
    },
    enabled: Boolean(accessToken),
  });

  const announcements = responseData?.data || [];
  const meta = responseData?.meta;

  const activePinnedCount = announcements.filter(
    (a) => a.pinned && a.status === 'PUBLISHED'
  ).length;

  // Mutations
  const publishMutation = useMutation({
    mutationFn: (id: string) => publishAnnouncement(accessToken, id, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setFeedbackError(null);
    },
    onError: (err: unknown) => {
      const error = err as Error;
      setFeedbackError(error?.message || 'Failed to publish announcement.');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveAnnouncement(accessToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => restoreAnnouncement(accessToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const pinMutation = useMutation({
    mutationFn: ({ id, pinned }: { id: string; pinned: boolean }) =>
      togglePinAnnouncement(accessToken, id, pinned),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setFeedbackError(null);
    },
    onError: (err: unknown) => {
      const error = err as Error;
      setFeedbackError(error?.message || 'Failed to pin. Max 3 active pinned notices allowed.');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => duplicateAnnouncement(accessToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAnnouncement(accessToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (err: unknown) => {
      const error = err as Error;
      setFeedbackError(error?.message || 'Cannot delete published announcement. Archive it first.');
    },
  });

  const statusBadge = (status: AnnouncementStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">PUBLISHED</Badge>;
      case 'DRAFT':
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">DRAFT</Badge>;
      case 'ARCHIVED':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">ARCHIVED</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="COMMUNICATION OVERSIGHT"
        title="Announcement Management Console"
        description="Broadcast verified university circulars, target audience cohorts, oversee priority pinned notices, and manage publication states."
        actions={
          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
            <Link href="/admin/announcements/create">
              <Plus size={14} className="mr-1" /> New Announcement
            </Link>
          </Button>
        }
      />

      {feedbackError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-800 flex items-center justify-between">
          <span>{feedbackError}</span>
          <button onClick={() => setFeedbackError(null)} className="font-bold text-slate-400 hover:text-slate-600">×</button>
        </div>
      )}

      {/* Pinned Counter & Status Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 overflow-x-auto pb-1 text-xs gap-4">
        <div className="flex items-center gap-2">
          {(['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`pb-2.5 px-3 font-bold border-b-2 transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {st === 'ALL' ? 'All Notices' : st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs pb-2 text-slate-600 font-semibold shrink-0">
          <Pin className="w-3.5 h-3.5 text-blue-600" />
          <span>Active Pinned: <strong className="text-blue-700">{activePinnedCount} / 3</strong></span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Search size={16} className="text-slate-400 shrink-0" />
        <Input
          type="text"
          placeholder="Filter announcements by title, topic, or content…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="text-xs"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={Megaphone}
          title="Failed to load announcements"
          description="Could not communicate with the bulletin service."
          action={<Button size="sm" onClick={() => refetch()}>Retry</Button>}
        />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements found"
          description="Create a new circular or switch status tabs to view notices."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Title & Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Target Audience</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Pinned</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {announcements.map((ann) => (
                  <tr key={ann.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-bold text-slate-900 line-clamp-1">{ann.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {formatDate(ann.publishedAt || ann.createdAt)}
                        {ann.author && ` · By ${ann.author.name}`}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {ann.category}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {ann.audience}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {statusBadge(ann.status)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => pinMutation.mutate({ id: ann.id, pinned: !ann.pinned })}
                        disabled={pinMutation.isPending}
                        title={ann.pinned ? 'Unpin announcement' : 'Pin to top of feed'}
                        className={`h-7 px-2 text-xs font-semibold ${
                          ann.pinned
                            ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            : 'text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        <Pin className={`w-3.5 h-3.5 mr-1 ${ann.pinned ? 'fill-blue-600' : ''}`} />
                        {ann.pinned ? 'Pinned' : 'Pin'}
                      </Button>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Publish */}
                        {ann.status === 'DRAFT' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => publishMutation.mutate(ann.id)}
                            disabled={publishMutation.isPending}
                            className="h-8 px-2.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-bold"
                          >
                            Publish
                          </Button>
                        )}

                        {/* Archive */}
                        {ann.status === 'PUBLISHED' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => archiveMutation.mutate(ann.id)}
                            disabled={archiveMutation.isPending}
                            title="Archive circular"
                            className="h-8 px-2 text-amber-700 hover:bg-amber-50"
                          >
                            <Archive size={14} />
                          </Button>
                        )}

                        {/* Restore to Draft */}
                        {ann.status === 'ARCHIVED' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => restoreMutation.mutate(ann.id)}
                            disabled={restoreMutation.isPending}
                            title="Restore circular to draft"
                            className="h-8 px-2 text-slate-600 hover:text-blue-600"
                          >
                            <RotateCcw size={14} />
                          </Button>
                        )}

                        {/* Duplicate */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => duplicateMutation.mutate(ann.id)}
                          disabled={duplicateMutation.isPending}
                          title="Duplicate notice"
                          className="h-8 px-2 text-slate-500 hover:text-slate-800"
                        >
                          <Copy size={14} />
                        </Button>

                        {/* Edit */}
                        <Button
                          size="sm"
                          variant="ghost"
                          asChild
                          title="Edit notice"
                          className="h-8 px-2 text-slate-600 hover:text-blue-600"
                        >
                          <Link href={`/admin/announcements/${ann.id}/edit`}>
                            <Edit size={14} />
                          </Link>
                        </Button>

                        {/* Delete */}
                        {ann.status !== 'PUBLISHED' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${ann.title}"?`)) {
                                deleteMutation.mutate(ann.id);
                              }
                            }}
                            title="Delete notice"
                            className="h-8 px-2 text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
