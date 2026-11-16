'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Edit,
  Share2,
  CalendarDays,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { EmptyState } from '@/components/dashboard/empty-state';
import { RsvpControlPanel } from '@/components/events/rsvp-control-panel';
import { getEventById } from '@/lib/api/events.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface EventDetailViewProps {
  id: string;
  currentRole: UserRole;
  basePath: string;
}

export function EventDetailView({ id, currentRole, basePath }: EventDetailViewProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  const {
    data: eventData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['event', id, accessToken],
    queryFn: async () => {
      const res = await getEventById(id, accessToken);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-md" />
        <div className="h-64 w-full bg-slate-200 animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !eventData) {
    return (
      <EmptyState
        icon={Calendar}
        title="Event not found"
        description="The requested gathering may have been cancelled or does not exist."
        action={
          <Button asChild size="sm" variant="outline">
            <Link href={`${basePath}/events`}>Back to Events</Link>
          </Button>
        }
      />
    );
  }

  const startDate = new Date(eventData.startsAt);
  const endDate = new Date(eventData.endsAt);

  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = `${startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })} – ${endDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })}`;

  const modeBadge = {
    IN_PERSON: { label: 'In Person', variant: 'success' as const },
    ONLINE: { label: 'Online Session', variant: 'neutral' as const },
    HYBRID: { label: 'Hybrid Gathering', variant: 'warning' as const },
  }[eventData.mode] || { label: eventData.mode, variant: 'neutral' as const };

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`${basePath}/events`}
        backLabel="Back to Events"
        eyebrow="CAMPUS EVENT"
        title={eventData.title}
        description={`${formattedDate} · ${formattedTime}`}
        badge={<Badge variant={modeBadge.variant}>{modeBadge.label}</Badge>}
        actions={
          currentRole === 'SUPER_ADMIN' ? (
            <Button asChild size="sm" variant="outline" className="gap-1.5 font-bold">
              <Link href={`/admin/events/${id}/edit`}>
                <Edit className="w-3.5 h-3.5" /> Edit Event
              </Link>
            </Button>
          ) : undefined
        }
      />

      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-950">
        {eventData.bannerUrl ? (
          <Image
            src={eventData.bannerUrl}
            alt={eventData.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
            <CalendarDays className="w-24 h-24 text-blue-500/20" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between flex-wrap gap-2 text-white">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider bg-blue-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-md inline-block">
              {eventData.category}
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white m-0 drop-shadow-sm">
              {eventData.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {eventData.counts.going} Confirmed
              {eventData.capacity ? ` / ${eventData.capacity}` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Description & Logistics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0">
              About This Gathering
            </h3>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {eventData.description}
            </div>
          </div>

          {/* Organizer Information */}
          {eventData.organizer && (
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0">
                Organized By
              </h3>
              <p className="text-base font-bold text-slate-900 m-0">{eventData.organizer}</p>
            </div>
          )}

          {/* Logistics & Location Details */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0 pb-2 border-b border-slate-100">
              Location & Access Logistics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">
                  Venue / Location
                </p>
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 mt-1">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{eventData.venue || 'To be announced on campus'}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">
                  Event Format
                </p>
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 mt-1">
                  <Video className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{modeBadge.label}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">
                  Confirmed Attendees
                </p>
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 mt-1">
                  <Users className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    {eventData.counts.going} verified participants
                    {eventData.counts.spotsRemaining !== null && (
                      <span className="text-emerald-600 font-medium ml-1">
                        ({eventData.counts.spotsRemaining} spots left)
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">
                  Eligibility & Admission
                </p>
                <div className="flex items-center gap-1.5 font-semibold text-emerald-700 mt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Free for Verified Campus Community</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: RSVP Control Panel & Quick Summary */}
        <div className="space-y-6">
          <RsvpControlPanel
            event={eventData}
            accessToken={accessToken}
            isAuthenticated={Boolean(user)}
          />
        </div>
      </div>
    </div>
  );
}
