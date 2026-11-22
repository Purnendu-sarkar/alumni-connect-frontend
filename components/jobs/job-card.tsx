'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, BriefcaseBusiness, Building2, MapPin } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { stripHtmlToPlainText } from '@/lib/utils/text';
import { formatDate } from '@/lib/utils/format';
import { useAuthStore } from '@/store/auth-store';
import type { Job } from '@/types/domain';

export function JobCard({ job }: { job: Job }) {
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

  const detailHref = isAuthenticated
    ? `${rolePrefix}/jobs/${job.id}`
    : `/login?returnTo=${encodeURIComponent(`/jobs/${job.id}`)}`;
  const ctaText = isAuthenticated ? 'View Position' : 'Sign in to View Position';
  return (
    <Card className="flex flex-col justify-between group hover:shadow-md hover:border-blue-300 transition-all duration-200">
      <div>
        <CardHeader className="p-0 mb-3">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="warning">{job.employmentType ?? 'Full-time'}</Badge>
            <span className="text-[11px] font-medium text-slate-400">
              {formatDate(job.createdAt)}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0 space-y-2">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors m-0">
            {job.title}
          </h3>

          <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 m-0">
            <Building2 size={13} className="text-slate-400 shrink-0" />
            {job.company}
          </p>

          <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-slate-400" />
              {job.location ?? 'Campus / Remote'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <BriefcaseBusiness size={13} className="text-slate-400" />
              Alumni Referral
            </span>
          </div>

          {job.description && (
            <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed m-0">
              {job.descriptionSnippet || stripHtmlToPlainText(job.description)}
            </p>
          )}
        </CardContent>
      </div>

      <CardFooter className="p-0 pt-4 mt-4 flex items-center justify-between border-t border-slate-100">
        <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
          Active Listing
        </span>
        <Button variant="ghost" size="sm" asChild className="p-0 h-auto font-bold text-blue-600 hover:text-blue-800 hover:bg-transparent">
          <Link href={detailHref} className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            {ctaText} <ArrowUpRight size={14} />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
