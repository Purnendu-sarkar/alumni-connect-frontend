'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Inbox,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';
import { demoNotifications, type NotificationItem } from '@/features/shared/demo-data';
import type { UserRole } from '@/types/domain';

interface NotificationsViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function NotificationsView({ currentRole, basePath }: NotificationsViewProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(demoNotifications);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [notice, setNotice] = useState<string | null>(null);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setNotice('All notifications marked as read.');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleClearAll = () => {
    setNotifications([]);
    setNotice('All notifications cleared.');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const filtered = notifications.filter((n) => (filter === 'UNREAD' ? !n.isRead : true));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="COMMUNICATION & ALERTS"
        title="Notifications Center"
        description="Stay informed about connection invitations, mentorship session updates, and departmental opportunities."
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={handleMarkAllRead} disabled={notifications.every((n) => n.isRead)}>
              <Check size={14} /> Mark all read
            </Button>
            <Button size="sm" variant="ghost" onClick={handleClearAll} disabled={notifications.length === 0} className="text-rose-600">
              <Trash2 size={14} /> Clear
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

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Alerts ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'UNREAD' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Unread Only ({notifications.filter((n) => !n.isRead).length})
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No notifications to display"
          description="You are fully caught up with your platform activities."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                !item.isRead ? 'bg-blue-50/30' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${
                    !item.isRead ? 'bg-blue-600' : 'bg-transparent'
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 m-0">{item.title}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">• {item.createdAt}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 m-0 leading-relaxed">{item.message}</p>
                  {item.link ? (
                    <Link
                      href={item.link}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline mt-2"
                    >
                      View related page <ExternalLink size={12} />
                    </Link>
                  ) : null}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleRead(item.id)}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 whitespace-nowrap p-1"
              >
                {item.isRead ? 'Mark unread' : 'Mark read'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
