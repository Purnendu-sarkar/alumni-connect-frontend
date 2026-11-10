'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';
import { demoEvents, type EventRecord } from '@/features/shared/demo-data';
import type { UserRole } from '@/types/domain';

interface MyEventsViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function MyEventsView({ currentRole, basePath }: MyEventsViewProps) {
  const [myEvents, setMyEvents] = useState<EventRecord[]>(
    demoEvents.filter((e) => e.isRegistered || e.id === 'event-1')
  );

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`${basePath}/events`}
        backLabel="Back to All Events"
        eyebrow="YOUR SCHEDULE"
        title="My Registered Events"
        description="Upcoming campus workshops, alumni panels, and reunions you have RSVPed to attend."
        actions={
          <Button asChild size="sm">
            <Link href={`${basePath}/events`}>Browse All Events</Link>
          </Button>
        }
      />

      {myEvents.length === 0 ? (
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
          {myEvents.map((ev) => (
            <div
              key={ev.id}
              className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start justify-between gap-4"
            >
              <div className="flex gap-4 items-start">
                <div className="flex flex-col items-center justify-center h-16 w-16 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 shrink-0 font-bold">
                  <span className="text-xl leading-none">{ev.day}</span>
                  <span className="text-[10px] tracking-wider uppercase mt-0.5">{ev.month}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 m-0">{ev.title}</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 size={11} /> RSVP Confirmed
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 m-0">
                    <MapPin size={12} className="inline mr-1 text-slate-400" />
                    {ev.location} · {ev.time}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-2 m-0">
                    {ev.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`${basePath}/events/${ev.id}`}>View Details</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
