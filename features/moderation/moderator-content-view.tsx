'use client';

import { useState } from 'react';
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
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { demoStories, type StoryRecord } from '@/features/shared/demo-data';
import type { UserRole } from '@/types/domain';

interface ModeratorContentViewProps {
  currentRole: UserRole;
  basePath: string;
  pendingOnly?: boolean;
}

export function ModeratorContentView({ currentRole, basePath, pendingOnly = false }: ModeratorContentViewProps) {
  const [contentList, setContentList] = useState<StoryRecord[]>(demoStories);
  const [notice, setNotice] = useState<string | null>(null);

  const displayedList = pendingOnly
    ? contentList.filter((c) => c.status !== 'PUBLISHED')
    : contentList;

  const handleApprove = (id: string, title: string) => {
    setContentList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'PUBLISHED' } : c))
    );
    setNotice(`Story "${title}" approved and published to the campus stories feed.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleReject = (id: string, title: string) => {
    setContentList((prev) => prev.filter((c) => c.id !== id));
    setNotice(`Story "${title}" rejected.`);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="EDITORIAL REVIEW"
        title="Content Moderation Desk"
        description="Review alumni success stories, articles, and community contributions before platform publication."
      />

      {notice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      ) : null}

      <div className="space-y-4">
        {displayedList.length === 0 ? (
          <EmptyState
            icon={FileCheck2}
            title="No Content Pending Review"
            description="All alumni stories and articles have been reviewed and published."
          />
        ) : (
          displayedList.map((story) => (
          <div
            key={story.id}
            className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    {story.category}
                  </span>
                  <StatusBadge status={story.status} />
                </div>
                <h3 className="text-base font-bold text-slate-900 m-0">{story.title}</h3>
                <p className="text-xs text-slate-500 m-0 mt-0.5">
                  Author: <strong className="text-slate-800">{story.author}</strong> ({story.authorRole} at {story.authorCompany})
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                <Button size="sm" variant="primary" onClick={() => handleApprove(story.id, story.title)}>
                  <Check size={14} /> Approve Article
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleReject(story.id, story.title)}
                  className="text-rose-600 hover:bg-rose-50"
                >
                  <X size={14} /> Reject
                </Button>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg text-xs leading-relaxed text-slate-700">
              <strong className="block text-slate-900 mb-1">Article Abstract:</strong>
              &quot;{story.summary}&quot;
            </div>

            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-slate-400">Word count: ~650 words · {story.readingTime}</span>
              <Button size="sm" variant="ghost" asChild>
                <Link href={`${basePath}/content/${story.id}`}>
                  Read Full Submission
                </Link>
              </Button>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}
