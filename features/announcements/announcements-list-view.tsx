'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Megaphone,
  Plus,
  Search,
  ShieldCheck,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { demoAnnouncements, type AnnouncementRecord } from '@/features/shared/demo-data';
import type { UserRole } from '@/types/domain';

interface AnnouncementsListViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function AnnouncementsListView({ currentRole, basePath }: AnnouncementsListViewProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>(demoAnnouncements);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const filtered = announcements.filter((ann) => {
    const matchPriority = priorityFilter === 'ALL' || ann.priority === priorityFilter;
    const term = search.toLowerCase();
    const haystack = [ann.title, ann.content, ann.author, ann.category].join(' ').toLowerCase();
    return matchPriority && (!term || haystack.includes(term));
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="OFFICIAL NOTICES & BULLETIN"
        title="Institutional Announcements"
        description="Official campus notices, verification deadlines, university advisories, and alumni initiatives."
        actions={
          currentRole === 'SUPER_ADMIN' ? (
            <Button asChild size="sm">
              <Link href={`${basePath}/announcements/create`}>
                <Plus size={14} /> Publish Announcement
              </Link>
            </Button>
          ) : null
        }
      />

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search announcements by keywords, advisory topics, or department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'ALL', label: 'All Notices' },
            { id: 'HIGH', label: 'High Priority' },
            { id: 'NORMAL', label: 'Regular Updates' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPriorityFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                priorityFilter === item.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No notices found"
          description="There are no announcements matching your search query."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((ann) => (
            <article
              key={ann.id}
              className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      ann.priority === 'HIGH' || ann.priority === 'URGENT'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {ann.priority} PRIORITY
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 font-medium">{ann.date}</span>
                </div>

                <Button size="sm" variant="ghost" asChild>
                  <Link href={`${basePath}/announcements/${ann.id}`}>
                    Read Full Notice
                  </Link>
                </Button>
              </div>

              <h3 className="text-base font-bold text-slate-900 m-0">
                <Link href={`${basePath}/announcements/${ann.id}`} className="hover:text-blue-600 transition-colors">
                  {ann.title}
                </Link>
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 m-0">
                {ann.content}
              </p>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                <span>Issued by: <strong className="text-slate-700">{ann.author}</strong> ({ann.authorRole})</span>
                <span>Category: {ann.category}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
