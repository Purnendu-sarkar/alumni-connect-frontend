'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Pin,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  User,
  GraduationCap,
  Briefcase,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/format';
import { stripHtmlToPlainText } from '@/lib/utils/text';
import { useAuthStore } from '@/store/auth-store';
import type { AnnouncementCard as AnnouncementCardType } from '@/types/domain';

interface AnnouncementCardProps {
  announcement: AnnouncementCardType;
  basePath?: string;
}

export function AnnouncementCard({
  announcement,
  basePath = '',
}: AnnouncementCardProps) {
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthenticated = mounted && Boolean(user);
  const rolePrefix =
    user?.role === 'SUPER_ADMIN'
      ? '/admin'
      : user?.role === 'MODERATOR'
        ? '/moderator'
        : user?.role === 'ALUMNI'
          ? '/alumni'
          : '/student';

  const isPublicView = !basePath || basePath === '';
  const detailUrl = isPublicView
    ? isAuthenticated
      ? `${rolePrefix}/announcements/${announcement.id}`
      : `/login?returnTo=${encodeURIComponent(`/announcements/${announcement.id}`)}`
    : `${basePath}/announcements/${announcement.id}`;

  const buttonLabel = isPublicView && !isAuthenticated ? 'Sign in to Read Notice' : 'Read Full Notice';

  const categoryBadgeColors = {
    GENERAL: 'bg-slate-100 text-slate-800 border-slate-200',
    ACADEMIC: 'bg-blue-50 text-blue-800 border-blue-200',
    CAREER: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    EVENT: 'bg-purple-50 text-purple-800 border-purple-200',
    SECURITY_SYSTEM: 'bg-rose-50 text-rose-800 border-rose-200',
  }[announcement.category] || 'bg-slate-100 text-slate-800 border-slate-200';

  const categoryLabel = {
    GENERAL: 'General Circular',
    ACADEMIC: 'Academic Notice',
    CAREER: 'Career & Placement',
    EVENT: 'Campus Event',
    SECURITY_SYSTEM: 'Security & System',
  }[announcement.category] || announcement.category;

  const audienceLabel = {
    ALL: 'All University',
    STUDENTS: 'Students Only',
    ALUMNI: 'Alumni Only',
  }[announcement.audience] || announcement.audience;

  return (
    <Card
      className={`flex flex-col justify-between overflow-hidden border transition-all duration-200 group bg-white ${
        announcement.pinned
          ? 'border-blue-400 shadow-md ring-1 ring-blue-300/40 bg-gradient-to-b from-blue-50/20 to-white'
          : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
      }`}
    >
      <div>
        <CardHeader className="p-5 pb-3">
          {/* Top badges bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {announcement.pinned && (
                <Badge className="bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 gap-1 shadow-sm">
                  <Pin className="w-3 h-3 fill-white" />
                  PINNED
                </Badge>
              )}
              {announcement.isNew && (
                <Badge className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 gap-1 animate-pulse">
                  <Sparkles className="w-3 h-3" />
                  NEW
                </Badge>
              )}
              <Badge className={`text-[10px] font-semibold border ${categoryBadgeColors}`}>
                {categoryLabel}
              </Badge>
            </div>

            <Badge variant="outline" className="text-[10px] font-medium text-slate-500 border-slate-200">
              {audienceLabel}
            </Badge>
          </div>

          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {announcement.title}
          </h3>
        </CardHeader>

        <CardContent className="px-5 py-0 space-y-3">
          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed m-0">
            {stripHtmlToPlainText(announcement.summary)}
          </p>

          <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formatDate(announcement.publishedAt || announcement.createdAt)}
            </span>
            {announcement.author && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 truncate font-medium text-slate-700">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{announcement.author.name}</span>
                </span>
              </>
            )}
          </div>
        </CardContent>
      </div>

      <CardFooter className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between mt-4">
        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          Verified Institutional Notice
        </span>

        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-0 h-auto"
        >
          <Link href={detailUrl} className="inline-flex items-center gap-1">
            {buttonLabel} <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
