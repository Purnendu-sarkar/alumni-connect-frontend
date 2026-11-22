'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getRoleWorkspaceConfig } from '@/lib/constants/site';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils/cn';

export interface LandingAuthCtasProps {
  variant: 'hero' | 'mentorship' | 'bottom-banner' | 'directory-action';
  className?: string;
}

export function LandingAuthCtas({ variant, className }: LandingAuthCtasProps) {
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthenticated = mounted && isInitialized && Boolean(user);
  const config = user ? getRoleWorkspaceConfig(user.role) : null;

  // 1. Hero variant
  if (variant === 'hero') {
    if (!isAuthenticated || !user || !config) {
      return (
        <div className={cn('flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2', className)}>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md">
            <Link href="/jobs" className="inline-flex items-center gap-2">
              Explore Opportunities <ArrowRight size={16} />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-white font-semibold">
            <Link href="/register">Join the Network</Link>
          </Button>
        </div>
      );
    }

    if (user.role === 'STUDENT') {
      return (
        <div className={cn('flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2', className)}>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md">
            <Link href="/student/directory" className="inline-flex items-center gap-2">
              Explore Alumni Directory <ArrowRight size={16} />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-white font-semibold">
            <Link href="/student/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      );
    }

    if (user.role === 'ALUMNI') {
      return (
        <div className={cn('flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2', className)}>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md">
            <Link href="/alumni/directory" className="inline-flex items-center gap-2">
              Explore Community Directory <ArrowRight size={16} />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-white font-semibold">
            <Link href="/alumni/jobs/create">Post a Job</Link>
          </Button>
        </div>
      );
    }

    if (user.role === 'MODERATOR') {
      return (
        <div className={cn('flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2', className)}>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md">
            <Link href="/moderator/dashboard" className="inline-flex items-center gap-2">
              Open Moderation Console <ArrowRight size={16} />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-white font-semibold">
            <Link href="/moderator/jobs">Review Pending Jobs</Link>
          </Button>
        </div>
      );
    }

    // SUPER_ADMIN
    return (
      <div className={cn('flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2', className)}>
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-2">
            Open Admin Console <ArrowRight size={16} />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-white font-semibold">
          <Link href="/admin/verification/pending">Verification Queue</Link>
        </Button>
      </div>
    );
  }

  // 2. Mentorship Banner variant
  if (variant === 'mentorship') {
    if (!isAuthenticated || !user || !config) {
      return (
        <div className={cn('shrink-0 flex flex-col sm:flex-row gap-3', className)}>
          <Button asChild size="lg" className="bg-white hover:bg-slate-100 text-blue-900 font-bold shadow-xs border-white">
            <Link href="/mentorship">Explore Mentors</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-blue-400 text-white hover:bg-blue-700 font-semibold">
            <Link href="/register">Become a Mentor</Link>
          </Button>
        </div>
      );
    }

    let secondaryHref = config.dashboardHref;
    let secondaryLabel = 'View Platform Overview';

    if (user.role === 'STUDENT') {
      secondaryHref = '/student/directory?mentorship=open';
      secondaryLabel = 'Find a Mentor';
    } else if (user.role === 'ALUMNI') {
      secondaryHref = '/alumni/mentorship/requests';
      secondaryLabel = 'Manage Mentorship';
    }

    return (
      <div className={cn('shrink-0 flex flex-col sm:flex-row gap-3', className)}>
        <Button asChild size="lg" className="bg-white hover:bg-slate-100 text-blue-900 font-bold shadow-xs border-white">
          <Link href="/mentorship">Explore Mentors</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="border-blue-400 text-white hover:bg-blue-700 font-semibold">
          <Link href={secondaryHref}>{secondaryLabel}</Link>
        </Button>
      </div>
    );
  }

  // 3. Bottom Banner variant
  if (variant === 'bottom-banner') {
    if (!isAuthenticated || !user || !config) {
      return (
        <div className={cn('shrink-0 flex items-center gap-3', className)}>
          <Button asChild size="default">
            <Link href="/events">Browse Events</Link>
          </Button>
          <Button asChild variant="outline" size="default">
            <Link href="/register">Create Profile</Link>
          </Button>
        </div>
      );
    }

    const isMember = user.role === 'STUDENT' || user.role === 'ALUMNI';
    const secondaryHref = isMember ? config.profileHref : config.dashboardHref;
    const secondaryLabel = isMember ? 'Update Your Profile' : 'Go to Dashboard';

    return (
      <div className={cn('shrink-0 flex items-center gap-3', className)}>
        <Button asChild size="default">
          <Link href="/events">Browse Events</Link>
        </Button>
        <Button asChild variant="outline" size="default">
          <Link href={secondaryHref}>{secondaryLabel}</Link>
        </Button>
      </div>
    );
  }

  // 4. Directory Action button (Section heading action)
  if (variant === 'directory-action') {
    if (!isAuthenticated || !user) {
      return (
        <Button asChild variant="outline" size="sm" className={className}>
          <Link href="/login?returnTo=/student/directory" className="inline-flex items-center gap-1.5 font-bold">
            Explore Full Directory <ArrowUpRight size={14} />
          </Link>
        </Button>
      );
    }

    let targetHref = '/student/directory';
    if (user.role === 'ALUMNI') {
      targetHref = '/alumni/directory';
    } else if (user.role === 'SUPER_ADMIN') {
      targetHref = '/admin/users/alumni';
    } else if (user.role === 'MODERATOR') {
      targetHref = '/moderator/dashboard';
    }

    return (
      <Button asChild variant="outline" size="sm" className={className}>
        <Link href={targetHref} className="inline-flex items-center gap-1.5 font-bold">
          Explore Full Directory <ArrowUpRight size={14} />
        </Link>
      </Button>
    );
  }

  return null;
}
