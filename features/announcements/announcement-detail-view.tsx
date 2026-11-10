'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, Megaphone, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/page-header';
import { demoAnnouncements, type AnnouncementRecord } from '@/features/shared/demo-data';
import type { UserRole } from '@/types/domain';

interface AnnouncementDetailViewProps {
  id: string;
  currentRole: UserRole;
  basePath: string;
}

export function AnnouncementDetailView({ id, currentRole, basePath }: AnnouncementDetailViewProps) {
  const announcement: AnnouncementRecord =
    demoAnnouncements.find((a) => a.id === id) || {
      id,
      title: 'Institutional Campus Advisory',
      date: 'November 2026',
      author: 'Academic Records Office',
      authorRole: 'University Administration',
      category: 'IMPORTANT',
      priority: 'HIGH',
      content:
        'Please observe official verification guidelines. Accounts must maintain accurate institutional credentials.',
    };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        backHref={`${basePath}/announcements`}
        backLabel="Back to Announcements"
        eyebrow="OFFICIAL NOTICE"
        title={announcement.title}
        description={`Published on ${announcement.date} by ${announcement.author} (${announcement.authorRole})`}
        badge={
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              announcement.priority === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
            }`}
          >
            {announcement.priority} PRIORITY
          </span>
        }
      />

      <div className="p-8 bg-white rounded-xl border border-slate-200 shadow-xs space-y-6">
        <div className="prose max-w-none text-slate-700 leading-relaxed text-sm whitespace-pre-line">
          {announcement.content}
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Authority: <strong>{announcement.author}</strong></span>
          <span>Category: {announcement.category}</span>
        </div>
      </div>
    </div>
  );
}
