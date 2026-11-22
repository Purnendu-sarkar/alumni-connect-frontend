'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  BellRing,
  CalendarDays,
  Clock,
  MapPin,
  Pin,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SafeRemoteImage } from '@/components/shared/safe-remote-image';
import { formatDate } from '@/lib/utils/format';
import { useAuthStore } from '@/store/auth-store';
import type { PublicAnnouncement, PublicEvent } from '@/lib/api/public.api';

interface CampusEventsDualFeedProps {
  events: PublicEvent[];
  announcements: PublicAnnouncement[];
}

export function CampusEventsDualFeed({
  events,
  announcements,
}: CampusEventsDualFeedProps) {
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

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Upcoming Campus & Virtual Events */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-blue-600 font-mono">
                CAMPUS CALENDAR
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight m-0">
                Upcoming Events & Symposia
              </h2>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/events" className="inline-flex items-center gap-1 font-bold">
                <span>All Events</span>
                <ArrowUpRight size={14} />
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {events.slice(0, 2).map((event, idx) => {
              const eventHref = isAuthenticated
                ? `${rolePrefix}/events/${event.slug || event.id}`
                : `/login?returnTo=${encodeURIComponent(`/events/${event.slug || event.id}`)}`;

              const fallbackBanner = `https://res.cloudinary.com/a1dumxpe/image/upload/alumni-connect/events/banners/banner_${(idx % 5) + 3}.jpg`;

              return (
                <Card
                  key={event.id}
                  className="flex flex-col sm:flex-row overflow-hidden bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                >
                  {/* Thumbnail Banner */}
                  <div className="relative sm:w-56 h-48 sm:h-auto bg-slate-900 shrink-0 overflow-hidden">
                    <SafeRemoteImage
                      src={event.bannerUrl ?? undefined}
                      alt={event.title}
                      fallbackSrc={fallbackBanner}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="warning">{event.eventType}</Badge>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col justify-between flex-1 space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                        <span className="flex items-center gap-1 text-blue-600">
                          <CalendarDays size={13} />
                          {formatDate(event.startsAt)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-slate-400" />
                          {event.venue ?? 'University Campus'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 m-0">
                        {event.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed m-0">
                        {event.descriptionSnippet}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                        Open for Registration
                      </span>
                      <Link
                        href={eventHref}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <span>{isAuthenticated ? 'RSVP & Details' : 'Sign in to RSVP'}</span>
                        <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Official Institutional Announcements */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-blue-600 font-mono">
                OFFICIAL BULLETIN
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight m-0">
                Institutional Notices
              </h2>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/announcements" className="inline-flex items-center gap-1 font-bold text-xs">
                <span>View Bulletin</span>
                <ArrowUpRight size={13} />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {announcements.slice(0, 3).map((notice) => {
              const noticeHref = isAuthenticated
                ? `${rolePrefix}/announcements/${notice.id}`
                : `/login?returnTo=${encodeURIComponent(`/announcements/${notice.id}`)}`;

              return (
                <Card
                  key={notice.id}
                  className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {notice.isPinned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md">
                          <Pin size={10} /> PINNED
                        </span>
                      )}
                      <Badge variant="outline">{notice.category}</Badge>
                    </div>
                    <span className="text-[11px] text-slate-600">
                      {formatDate(notice.publishedAt)}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 m-0">
                    {notice.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed m-0">
                    {notice.summary}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end">
                    <Link
                      href={noticeHref}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <span>Read Full Notice</span>
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
