'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Users,
  ArrowUpRight,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';
import { AddToCalendar } from '@/components/events/add-to-calendar';
import { stripHtmlToPlainText } from '@/lib/utils/text';
import { getMyEventRsvps } from '@/lib/api/events.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface MyEventsViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function MyEventsView({ currentRole, basePath }: MyEventsViewProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [page, setPage] = useState(1);

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['my-rsvps', accessToken, page],
    queryFn: async () => {
      if (!accessToken) return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } };
      return getMyEventRsvps(accessToken, page, 20);
    },
    enabled: Boolean(accessToken),
  });

  const rsvpItems = responseData?.data || [];
  const meta = responseData?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`${basePath}/events`}
        backLabel="Back to All Events"
        eyebrow="YOUR SCHEDULE"
        title="My Registered Events"
        description="Upcoming campus workshops, alumni panels, and reunions you have RSVPed to attend."
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href={`${basePath}/events`}>Browse All Events</Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 bg-white rounded-xl border border-slate-200 space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={Calendar}
          title="Failed to load your events"
          description="Could not retrieve your registered gatherings. Please try again."
          action={
            <Button size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : rsvpItems.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No registered events yet"
          description="Explore upcoming campus webinars and panels to RSVP for future sessions."
          action={
            <Button size="sm" asChild>
              <Link href={`${basePath}/events`}>Explore Events</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {rsvpItems.map((item) => {
            const ev = item.event;
            const startDate = new Date(ev.startsAt);
            const day = startDate.getDate().toString().padStart(2, '0');
            const month = startDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
            const time = startDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            });

            return (
              <div
                key={item.rsvpId}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row gap-5 items-start justify-between"
              >
                <div className="flex gap-4 items-start flex-1">
                  {/* Date badge */}
                  <div className="flex flex-col items-center justify-center h-16 w-16 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 shrink-0 font-bold">
                    <span className="text-xl leading-none">{day}</span>
                    <span className="text-[10px] tracking-wider uppercase mt-0.5">{month}</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        className={`text-[10px] font-bold ${
                          item.rsvpStatus === 'GOING'
                            ? 'bg-emerald-600 text-white'
                            : item.rsvpStatus === 'WAITLISTED'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-600 text-white'
                        }`}
                      >
                        {item.rsvpStatus === 'GOING' && (
                          <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                        )}
                        {item.rsvpStatus === 'WAITLISTED' && (
                          <AlertCircle className="w-3 h-3 mr-1 inline" />
                        )}
                        {item.rsvpStatus}
                      </Badge>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Clock size={12} /> {time}
                      </span>
                      {ev.venue && (
                        <>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <MapPin size={12} /> {ev.venue}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 m-0 hover:text-blue-600 transition-colors">
                      <Link href={`${basePath}/events/${ev.id}`}>{ev.title}</Link>
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed m-0">
                      {ev.descriptionSnippet || stripHtmlToPlainText(ev.description)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <AddToCalendar event={ev} size="sm" variant="outline" />
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`${basePath}/events/${ev.id}`}>
                      Details <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
