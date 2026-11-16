'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, CalendarDays, Clock, MapPin, Sparkles, Users, Calendar } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionHeading } from '@/components/ui/section-heading';
import { EmptyState } from '@/components/dashboard/empty-state';
import { getEvents } from '@/lib/api/events.api';
import type { EventCard as EventCardType } from '@/types/domain';

export default function EventsPage() {
  const { data: responseData, isLoading, isError, refetch } = useQuery({
    queryKey: ['public-events'],
    queryFn: () => getEvents({ tab: 'upcoming', limit: 20 }),
  });

  const events = responseData?.data || [];
  const featured = events[0];
  const upcoming = events.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold font-mono uppercase tracking-wider">
          <CalendarDays size={14} /> The Gathering Place
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight m-0">
          Show up for the conversation.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed m-0">
          The community grows stronger when we share the same room. Explore official convocations, tech symposiums, and informal regional meetups.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
          </div>
        </div>
      ) : isError ? (
        <EmptyState
          icon={Calendar}
          title="Could not load campus gatherings"
          description="We encountered an issue connecting to the events registry. Please try again."
          action={
            <Button size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No upcoming events scheduled"
          description="Check back soon for new campus conferences, reunions, and technical workshops."
        />
      ) : (
        <>
          {/* Featured Event Card */}
          {featured && (
            <Card className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white border-slate-800 p-8 sm:p-12 relative overflow-hidden shadow-xl">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 flex items-center gap-1">
                      <Sparkles size={12} /> Key Event of the Season
                    </span>
                    <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                      {featured.mode}
                    </Badge>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight m-0">
                    {featured.title}
                  </h2>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed m-0 line-clamp-3">
                    {featured.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
                    {featured.venue && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={15} className="text-blue-400" /> {featured.venue}
                      </span>
                    )}
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={15} className="text-blue-400" />
                      {new Date(featured.startsAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Date Box & Action */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 text-center flex flex-col items-center justify-center min-w-[200px] w-full lg:w-auto shrink-0 space-y-4">
                  <div>
                    <span className="block text-4xl sm:text-5xl font-extrabold text-white font-mono">
                      {new Date(featured.startsAt).getDate().toString().padStart(2, '0')}
                    </span>
                    <span className="block text-xs font-bold uppercase tracking-widest text-blue-300 font-mono mt-1">
                      {new Date(featured.startsAt).toLocaleString('en-US', { month: 'short' })}{' '}
                      {new Date(featured.startsAt).getFullYear()}
                    </span>
                  </div>

                  <Button asChild size="default" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold">
                    <Link href={`/events/${featured.id}`}>
                      RSVP & Passes <ArrowUpRight size={14} />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Upcoming Events Grid */}
          {upcoming.length > 0 && (
            <div>
              <SectionHeading
                eyebrow="SCHEDULED CONVERSATIONS"
                title="Upcoming Campus & Virtual Sessions"
                description="Mark your calendar and engage with speakers and participants."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {upcoming.map((event) => {
                  const sDate = new Date(event.startsAt);
                  const day = sDate.getDate().toString().padStart(2, '0');
                  const month = sDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();

                  return (
                    <Card
                      key={event.id}
                      className="flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all duration-200 p-6 bg-white"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center text-center shrink-0">
                          <span className="text-xl font-extrabold text-blue-700 font-mono leading-none">
                            {day}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 font-mono mt-0.5">
                            {month}
                          </span>
                        </div>

                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant={event.mode === 'IN_PERSON' ? 'success' : 'neutral'}>
                              {event.mode}
                            </Badge>
                          </div>

                          <h3 className="text-base font-bold text-slate-900 m-0 line-clamp-1">
                            {event.title}
                          </h3>

                          <p className="text-xs text-slate-600 leading-relaxed m-0 line-clamp-2">
                            {event.description}
                          </p>

                          <div className="flex items-center gap-3 text-xs text-slate-500 pt-2">
                            {event.venue && (
                              <span className="flex items-center gap-1 truncate">
                                <MapPin size={13} className="text-slate-400 shrink-0" /> {event.venue}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <CardFooter className="p-0 pt-4 mt-6 border-t border-slate-100 flex items-center justify-end">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/events/${event.id}`} className="inline-flex items-center gap-1 font-semibold">
                            Event Details <ArrowUpRight size={13} />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Propose an Event CTA Card */}
      <Card className="bg-slate-50 border-slate-200 p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-none">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-xl border border-slate-200 text-blue-600 shrink-0">
            <Users size={24} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-mono">
              HOST A SESSION
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5 m-0">
              Have an idea for a campus or regional meetup?
            </h3>
            <p className="text-xs text-slate-500 mt-1 m-0">
              Submit an event proposal to the alumni relations committee for campus room booking and co-promotion.
            </p>
          </div>
        </div>

        <Button asChild size="sm" className="shrink-0 font-bold bg-blue-600 hover:bg-blue-700 text-white">
          <Link href="/register">Propose an Event</Link>
        </Button>
      </Card>
    </div>
  );
}
