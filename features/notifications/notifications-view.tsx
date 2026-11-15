'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Inbox,
  Info,
  RefreshCw,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { TableSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import {
  deleteNotification,
  getNotifications,
  getSafeRoleNotificationLink,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
  type NotificationType,
} from '@/lib/api/notifications';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface NotificationsViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function NotificationsView({ currentRole, basePath }: NotificationsViewProps) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<NotificationItem | null>(null);

  const notificationsQuery = useQuery({
    queryKey: ['notifications', filter, selectedType, page, accessToken],
    queryFn: async () => {
      const res = await getNotifications({
        filter: filter === 'UNREAD' ? 'unread' : 'all',
        type: selectedType !== 'ALL' ? (selectedType as NotificationType) : undefined,
        page,
        limit: 15,
      });
      return {
        items: res.data ?? [],
        meta: res.meta ?? { page: 1, limit: 15, total: 0, totalPages: 1 },
      };
    },
    enabled: Boolean(accessToken),
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setNotice('All notifications marked as read.');
      setTimeout(() => setNotice(null), 3000);
    },
  });

  const markSingleMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setNotice('Notification removed.');
      setTimeout(() => setNotice(null), 3000);
    },
  });

  const handleOpenDetail = (item: NotificationItem) => {
    setSelectedItem(item);
    if (!item.isRead) {
      markSingleMutation.mutate(item.id);
    }
  };

  const formatMetaKey = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim();
  };

  const data = notificationsQuery.data?.items ?? [];
  const meta = notificationsQuery.data?.meta ?? { page: 1, limit: 15, total: 0, totalPages: 1 };

  const getSafeLink = (link?: string | null) => {
    if (!link) return null;
    return getSafeRoleNotificationLink(link, currentRole);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="COMMUNICATION & SECURITY ALERTS"
        title="Notifications Center"
        description="Stay informed about credential reviews, connection requests, system security alerts, and campus activities."
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending || data.length === 0}
            >
              <Check size={14} /> Mark all read
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => notificationsQuery.refetch()}
              disabled={notificationsQuery.isFetching}
            >
              <RefreshCw size={13} className={notificationsQuery.isFetching ? 'animate-spin' : ''} />
            </Button>
          </div>
        }
      />

      {notice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      ) : null}

      {/* Filter Tabs & Category Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setFilter('ALL');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Alerts ({meta.total})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilter('UNREAD');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'UNREAD'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Unread Only
          </button>
        </div>

        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="ALL">All Categories</option>
          <option value="SECURITY_ALERT">Security Alerts</option>
          <option value="ACCOUNT_VERIFICATION">Account & Verification</option>
          <option value="MODERATION_RESULT">Accreditation Reviews</option>
          <option value="CONNECTION_REQUEST">Connections</option>
          <option value="MENTORSHIP_REQUEST">Mentorship</option>
          <option value="JOB_APPROVED">Jobs & Applications</option>
          <option value="ANNOUNCEMENT">Announcements</option>
        </select>
      </div>

      {notificationsQuery.isLoading ? (
        <TableSkeleton rows={5} cols={3} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No notifications to display"
          description={
            filter === 'UNREAD'
              ? 'You have caught up with all unread notifications.'
              : 'You have no alerts matching the selected filter.'
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {data.map((item) => {
            const safeLink = getSafeLink(item.link);
            const isSecurity = item.type === 'SECURITY_ALERT' || item.type === 'RESTRICTION_APPLIED';

            return (
              <div
                key={item.id}
                className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                  !item.isRead ? 'bg-blue-50/30' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isSecurity ? (
                    <div className="p-2 rounded-lg bg-rose-50 text-rose-600 shrink-0 mt-0.5">
                      <ShieldAlert size={16} />
                    </div>
                  ) : (
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${
                        !item.isRead ? 'bg-blue-600' : 'bg-transparent'
                      }`}
                    />
                  )}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 m-0">{item.title}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {item.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        • {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 m-0 leading-relaxed">{item.body}</p>

                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(item)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline cursor-pointer"
                      >
                        <Eye size={12} className="text-slate-500" /> View Details
                      </button>
                      {safeLink ? (
                        <Link
                          href={safeLink}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Go to related page <ExternalLink size={12} />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!item.isRead ? (
                    <button
                      type="button"
                      onClick={() => markSingleMutation.mutate(item.id)}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 p-1"
                    >
                      Mark read
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {meta.totalPages > 1 ? (
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>
            Showing Page <strong>{meta.page}</strong> of <strong>{meta.totalPages}</strong> ({meta.total} alerts)
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      {/* Premium Notification Details Modal */}
      {selectedItem ? (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {selectedItem.type === 'SECURITY_ALERT' || selectedItem.type === 'RESTRICTION_APPLIED' ? (
                  <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 shrink-0">
                    <ShieldAlert size={18} />
                  </div>
                ) : (
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                    <Info size={18} />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 m-0">Notification Details</h3>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {selectedItem.type.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 m-0">{selectedItem.title}</h4>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1 font-mono">
                  <Clock size={11} />
                  <span>{new Date(selectedItem.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto">
                <p className="m-0 whitespace-pre-wrap">{selectedItem.body}</p>
              </div>

              {selectedItem.metadata && Object.keys(selectedItem.metadata).length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Context & Metadata:
                  </span>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 divide-y divide-slate-100 text-xs max-h-36 overflow-y-auto">
                    {Object.entries(selectedItem.metadata).map(([k, v]) => (
                      <div key={k} className="py-1.5 flex items-start justify-between gap-2">
                        <span className="text-slate-500 font-medium">{formatMetaKey(k)}:</span>
                        <span className="font-mono text-slate-800 text-right break-all">
                          {typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div>
                {selectedItem.link ? (
                  <Link
                    href={getSafeRoleNotificationLink(selectedItem.link, currentRole)}
                    onClick={() => setSelectedItem(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
                  >
                    Go to Related Page <ExternalLink size={12} />
                  </Link>
                ) : null}
              </div>
              <Button size="sm" variant="secondary" onClick={() => setSelectedItem(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
