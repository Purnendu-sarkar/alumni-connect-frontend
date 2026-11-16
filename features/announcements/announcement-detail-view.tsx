'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Megaphone,
  ShieldCheck,
  Pin,
  Sparkles,
  Edit,
  User,
  AlertTriangle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { EmptyState } from '@/components/dashboard/empty-state';
import { SanitizedRichText } from '@/components/announcements/sanitized-rich-text';
import { getAnnouncementById } from '@/lib/api/announcements.api';
import { formatDate } from '@/lib/utils/format';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface AnnouncementDetailViewProps {
  id: string;
  currentRole: UserRole;
  basePath: string;
}

export function AnnouncementDetailView({
  id,
  currentRole,
  basePath,
}: AnnouncementDetailViewProps) {
  const accessToken = useAuthStore((state) => state.accessToken);

  const {
    data: announcementData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['announcement', id, accessToken],
    queryFn: async () => {
      const res = await getAnnouncementById(id, accessToken);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="p-8 bg-white rounded-xl border border-slate-200 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (isError || !announcementData) {
    return (
      <EmptyState
        icon={Megaphone}
        title="Notice not found"
        description="This institutional announcement may have been archived, removed, or is not available for your role."
        action={
          <Button asChild size="sm" variant="outline">
            <Link href={`${basePath}/announcements`}>Back to Bulletins</Link>
          </Button>
        }
      />
    );
  }

  const categoryBadgeColors = {
    GENERAL: 'bg-slate-100 text-slate-800 border-slate-200',
    ACADEMIC: 'bg-blue-50 text-blue-800 border-blue-200',
    CAREER: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    EVENT: 'bg-purple-50 text-purple-800 border-purple-200',
    SECURITY_SYSTEM: 'bg-rose-50 text-rose-800 border-rose-200',
  }[announcementData.category] || 'bg-slate-100 text-slate-800 border-slate-200';

  const categoryLabel = {
    GENERAL: 'General Circular',
    ACADEMIC: 'Academic Notice',
    CAREER: 'Career & Placement',
    EVENT: 'Campus Event',
    SECURITY_SYSTEM: 'Security & System',
  }[announcementData.category] || announcementData.category;

  const audienceLabel = {
    ALL: 'All University Members',
    STUDENTS: 'Current Students Only',
    ALUMNI: 'Accredited Alumni Only',
  }[announcementData.audience] || announcementData.audience;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        backHref={`${basePath}/announcements`}
        backLabel="Back to Announcements"
        eyebrow="OFFICIAL INSTITUTIONAL BULLETIN"
        title={announcementData.title}
        description={`Issued on ${formatDate(
          announcementData.publishedAt || announcementData.createdAt
        )}`}
        badge={
          <div className="flex items-center gap-1.5 flex-wrap">
            {announcementData.pinned && (
              <Badge className="bg-blue-600 text-white font-bold text-xs gap-1">
                <Pin className="w-3 h-3 fill-white" /> PINNED
              </Badge>
            )}
            {announcementData.isNew && (
              <Badge className="bg-emerald-600 text-white font-bold text-xs gap-1">
                <Sparkles className="w-3 h-3" /> NEW
              </Badge>
            )}
            <Badge className={`text-xs font-semibold border ${categoryBadgeColors}`}>
              {categoryLabel}
            </Badge>
          </div>
        }
        actions={
          currentRole === 'SUPER_ADMIN' ? (
            <Button asChild size="sm" variant="outline" className="gap-1.5 font-bold">
              <Link href={`/admin/announcements/${id}/edit`}>
                <Edit className="w-3.5 h-3.5" /> Edit Notice
              </Link>
            </Button>
          ) : undefined
        }
      />

      {/* Archived Notice Banner */}
      {announcementData.isArchived && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-900 m-0 leading-relaxed font-medium">
            <strong>Archived Notice:</strong> This circular has concluded its active broadcast period
            and is preserved for institutional reference and historical audit.
          </p>
        </div>
      )}

      {/* Notice Card */}
      <div className="p-8 bg-white rounded-xl border border-slate-200 shadow-xs space-y-6">
        {/* Meta Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Audience:</span>
            <Badge variant="outline" className="text-[11px] font-semibold text-slate-700">
              {audienceLabel}
            </Badge>
          </div>

          {announcementData.author && (
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Issued by <strong>{announcementData.author.name}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Sanitized Body */}
        <SanitizedRichText content={announcementData.body} />

        {/* Footer Authority */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
          <span className="flex items-center gap-1 text-slate-600 font-semibold">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Official University Communication
          </span>

          {announcementData.editedAt && (
            <span className="text-[11px] text-slate-400">
              Last updated: {formatDate(announcementData.editedAt)} (v{announcementData.version})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
