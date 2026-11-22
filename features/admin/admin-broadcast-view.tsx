'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  History,
  Link2,
  Megaphone,
  Radio,
  RefreshCw,
  Send,
  ShieldAlert,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  sendAdminBroadcast,
  getAdminBroadcasts,
  type BroadcastPayload,
  type BroadcastHistoryItem,
} from '@/lib/api/admin.api';
import { getApiErrorMessage } from '@/lib/api/error-utils';
import { formatDate } from '@/lib/utils/format';
import { useAuthStore } from '@/store/auth-store';

interface AdminBroadcastViewProps {
  basePath: string;
}

const AUDIENCE_OPTIONS: {
  value: 'ALL' | 'STUDENTS' | 'ALUMNI' | 'MODERATORS';
  label: string;
  description: string;
}[] = [
  {
    value: 'ALL',
    label: 'All Campus Community (Students, Alumni & Staff)',
    description: 'Broadcast to every active enrolled student, accredited alumnus, and faculty moderator.',
  },
  {
    value: 'STUDENTS',
    label: 'Enrolled Students Only',
    description: 'Target only currently registered students for academic notices or campus drives.',
  },
  {
    value: 'ALUMNI',
    label: 'Accredited Alumni Only',
    description: 'Target validated alumni for reunion announcements, giving campaigns, or mentorship calls.',
  },
  {
    value: 'MODERATORS',
    label: 'Faculty Moderators Only',
    description: 'Direct administrative instructions or queue priority notices to moderation staff.',
  },
];

const CATEGORY_OPTIONS: {
  value: 'GENERAL' | 'ACADEMIC' | 'CAREER' | 'EVENT' | 'SECURITY_SYSTEM';
  label: string;
}[] = [
  { value: 'GENERAL', label: 'General Announcement' },
  { value: 'ACADEMIC', label: 'Academic & Semester Policy' },
  { value: 'CAREER', label: 'Career Fair & Placement Alert' },
  { value: 'EVENT', label: 'Campus Event & Convocation' },
  { value: 'SECURITY_SYSTEM', label: 'System Maintenance & Security' },
];

export function AdminBroadcastView({ basePath }: AdminBroadcastViewProps) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  // Form states
  const [audience, setAudience] = useState<'ALL' | 'STUDENTS' | 'ALUMNI' | 'MODERATORS'>('ALL');
  const [category, setCategory] = useState<'GENERAL' | 'ACADEMIC' | 'CAREER' | 'EVENT' | 'SECURITY_SYSTEM'>('GENERAL');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Query: Broadcast Dispatch History
  const historyQuery = useQuery({
    queryKey: ['admin-broadcasts', accessToken],
    queryFn: async () => {
      const res = await getAdminBroadcasts(accessToken);
      if (!res.success || !res.data) throw new Error(res.message || 'Failed to load broadcasts');
      return res.data;
    },
    enabled: Boolean(accessToken),
  });

  const broadcastMutation = useMutation({
    mutationFn: (payload: BroadcastPayload) => sendAdminBroadcast(accessToken, payload),
    onSuccess: (res) => {
      setConfirmModalOpen(false);
      setTitle('');
      setMessage('');
      setLink('');
      setNotice(
        `System broadcast successfully dispatched to ${res.data?.recipientCount ?? 'targeted'} member(s).`,
      );
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ['admin-broadcasts'] });
      setTimeout(() => setNotice(null), 5000);
    },
    onError: (err: unknown) => {
      setFormError(getApiErrorMessage(err, 'Failed to dispatch broadcast alert.'));
      setConfirmModalOpen(false);
    },
  });

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setFormError(null);

    const trimmedTitle = title.trim();
    const trimmedMsg = message.trim();
    const trimmedLink = link.trim();

    if (trimmedTitle.length < 5) {
      setFormError('Broadcast title must be at least 5 characters.');
      return;
    }
    if (trimmedMsg.length < 10) {
      setFormError('Broadcast message must be at least 10 characters.');
      return;
    }
    if (trimmedLink && !trimmedLink.startsWith('/')) {
      setFormError('Redirect link must be a relative internal path starting with "/" (e.g. /events or /jobs).');
      return;
    }

    setConfirmModalOpen(true);
  };

  const handleDispatch = () => {
    broadcastMutation.mutate({
      audience,
      category,
      title: title.trim(),
      message: message.trim(),
      link: link.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {notice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      ) : null}

      {formError ? <FormAlert>{formError}</FormAlert> : null}

      {/* 1. BROADCAST COMPOSER CARD */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
              <Megaphone size={16} className="text-blue-600" />
              Compose Institutional System Broadcast
            </h3>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Send immediate, high-priority notifications to targeted cohorts across the university network.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            Super Admin Dispatcher
          </span>
        </div>

        <form onSubmit={handleOpenConfirm} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Target Recipient Audience *
              </label>
              <select
                value={audience}
                onChange={(e) =>
                  setAudience(e.target.value as 'ALL' | 'STUDENTS' | 'ALUMNI' | 'MODERATORS')
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
              >
                {AUDIENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                {AUDIENCE_OPTIONS.find((o) => o.value === audience)?.description}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Broadcast Category *
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value as 'GENERAL' | 'ACADEMIC' | 'CAREER' | 'EVENT' | 'SECURITY_SYSTEM',
                  )
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Categorizes this broadcast badge in user notification feeds.
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-800">
                Broadcast Headline / Title *
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {title.length} / 120
              </span>
            </div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Annual Campus Career Fair Registration Opens Tomorrow"
              maxLength={120}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-800">
                Notification Message Body *
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {message.length} / 1000
              </span>
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Detail the official notice, dates, instructions, or actions required from members..."
              rows={4}
              maxLength={1000}
              required
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Optional Internal Destination Link
            </label>
            <Input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="e.g. /events or /jobs or /announcements"
              hint="Must be an internal relative path starting with '/'."
              maxLength={200}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <Button type="submit" size="sm" disabled={broadcastMutation.isPending}>
              <Send size={14} className={broadcastMutation.isPending ? 'animate-bounce' : ''} />
              Review & Dispatch Broadcast
            </Button>
          </div>
        </form>
      </div>

      {/* 2. RECENT BROADCAST DISPATCH HISTORY TABLE */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
              <History size={16} className="text-slate-600" />
              Recent System Broadcast Dispatch History
            </h3>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Immutable audit log records of administrative broadcasts sent to the campus network.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => historyQuery.refetch()}
            disabled={historyQuery.isFetching}
            className="text-xs"
          >
            <RefreshCw size={12} className={historyQuery.isFetching ? 'animate-spin' : ''} /> Refresh
          </Button>
        </div>

        {historyQuery.isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading broadcast history…</div>
        ) : !historyQuery.data || historyQuery.data.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No system broadcasts have been dispatched yet for this institution.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Date Dispatched</th>
                  <th className="py-2.5 px-3">Audience</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Headline / Title</th>
                  <th className="py-2.5 px-3">Sender</th>
                  <th className="py-2.5 px-3 text-right">Recipients</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyQuery.data.map((item: BroadcastHistoryItem) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-700 whitespace-nowrap">
                      {formatDate(item.sentAt, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        <Users size={10} /> {item.audience}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 max-w-xs truncate">{item.title}</div>
                      {item.link ? (
                        <span className="text-[10px] text-blue-600 font-mono inline-flex items-center gap-0.5">
                          {item.link} <ExternalLink size={9} />
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">{item.senderName}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-mono">
                        {item.recipientCount.toLocaleString()} Reached
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <Radio size={18} className="text-blue-600 animate-pulse" />
              Confirm Immediate Campus Broadcast
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-xs leading-relaxed">
              You are about to dispatch an official system notification. This action cannot be undone and will immediately create notifications in the feeds of all active members matching the target audience.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div>
              <span className="text-slate-400 uppercase text-[10px] font-bold block">Target Audience:</span>
              <strong className="text-slate-800">{audience}</strong> (
              {AUDIENCE_OPTIONS.find((o) => o.value === audience)?.label})
            </div>

            <div>
              <span className="text-slate-400 uppercase text-[10px] font-bold block">Headline:</span>
              <strong className="text-slate-900">{title}</strong>
            </div>

            {link ? (
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Redirect:</span>
                <span className="font-mono text-blue-600">{link}</span>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmModalOpen(false)}
              disabled={broadcastMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleDispatch}
              disabled={broadcastMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {broadcastMutation.isPending ? 'Dispatching…' : 'Confirm & Dispatch Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
