'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getRoleWorkspaceConfig } from '@/lib/constants/site';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils/cn';

export interface PublicWorkspaceBannerProps {
  resource: 'jobs' | 'events' | 'announcements' | 'stories';
  className?: string;
}

export function PublicWorkspaceBanner({ resource, className }: PublicWorkspaceBannerProps) {
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isInitialized || !user) {
    return null;
  }

  const roleConfig = getRoleWorkspaceConfig(user.role);

  let targetUrl = roleConfig.dashboardHref;
  let targetTitle = 'Workspace';

  if (resource === 'jobs') {
    if (user.role === 'STUDENT') {
      targetUrl = '/student/jobs';
      targetTitle = 'Opportunities Desk';
    } else if (user.role === 'ALUMNI') {
      targetUrl = '/alumni/jobs';
      targetTitle = 'Job Management';
    } else if (user.role === 'MODERATOR') {
      targetUrl = '/moderator/jobs';
      targetTitle = 'Job Queue';
    } else {
      targetUrl = '/admin/jobs';
      targetTitle = 'Jobs Management';
    }
  } else if (resource === 'events') {
    if (user.role === 'STUDENT') {
      targetUrl = '/student/events';
      targetTitle = 'Campus Events';
    } else if (user.role === 'ALUMNI') {
      targetUrl = '/alumni/events';
      targetTitle = 'Campus Events';
    } else if (user.role === 'MODERATOR') {
      targetUrl = '/moderator/events';
      targetTitle = 'Events Desk';
    } else {
      targetUrl = '/admin/events';
      targetTitle = 'Events Management';
    }
  } else if (resource === 'announcements') {
    if (user.role === 'STUDENT') {
      targetUrl = '/student/announcements';
      targetTitle = 'Official Notices';
    } else if (user.role === 'ALUMNI') {
      targetUrl = '/alumni/announcements';
      targetTitle = 'Official Notices';
    } else if (user.role === 'MODERATOR') {
      targetUrl = '/moderator/announcements';
      targetTitle = 'Notices Desk';
    } else {
      targetUrl = '/admin/announcements';
      targetTitle = 'Notices Management';
    }
  } else if (resource === 'stories') {
    if (user.role === 'STUDENT') {
      targetUrl = '/student/stories';
      targetTitle = 'Alumni Stories';
    } else if (user.role === 'ALUMNI') {
      targetUrl = '/alumni/stories';
      targetTitle = 'Stories Portal';
    } else if (user.role === 'MODERATOR') {
      targetUrl = '/moderator/content';
      targetTitle = 'Content Moderation';
    } else {
      targetUrl = '/admin/stories';
      targetTitle = 'Stories Management';
    }
  }

  return (
    <div
      className={cn(
        'p-4 rounded-2xl bg-blue-50/80 border border-blue-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0">
          <Compass size={18} />
        </div>
        <div className="text-xs text-slate-700 leading-snug">
          <span className="font-semibold text-slate-900">Signed in as {user.name}</span>
          <span className="text-blue-700 font-bold ml-1.5 font-mono text-[11px]">({roleConfig.roleLabel})</span>
          <p className="text-slate-500 m-0 mt-0.5">
            Viewing public showcase. Switch to your role-scoped desk to participate or manage records.
          </p>
        </div>
      </div>
      <Button asChild size="sm" className="shrink-0 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
        <Link href={targetUrl} className="inline-flex items-center gap-1.5">
          Open {roleConfig.roleLabel} {targetTitle}
          <ArrowRight size={14} />
        </Link>
      </Button>
    </div>
  );
}
