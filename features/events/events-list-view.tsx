'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';
import { demoEvents, type EventRecord } from '@/features/shared/demo-data';
import type { UserRole } from '@/types/domain';

interface EventsListViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function EventsListView({ currentRole, basePath }: EventsListViewProps) {
  const [events, setEvents] = useState<EventRecord[]>(demoEvents);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleRegister = (id: string, title: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isRegistered: !e.isRegistered, attendeesCount: e.isRegistered ? e.attendeesCount - 1 : e.attendeesCount + 1 } : e))
    );
    const ev = events.find((e) => e.id === id);
    setActionNotice(
      ev?.isRegistered
        ? `Registration cancelled for "${title}".`
        : `You are registered for "${title}"! Calendar invitation confirmed.`
    );
    setTimeout(() => setActionNotice(null), 4000);
  };

  const filteredEvents = events.filter((ev) => {
    const matchCategory = categoryFilter === 'ALL' || ev.category === categoryFilter;
    const term = search.toLowerCase();
    const haystack = [ev.title, ev.description, ev.location, ev.speaker].filter(Boolean).join(' ').toLowerCase();
    return matchCategory && (!term || haystack.includes(term));
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CAMPUS & ALUMNI GATHERINGS"
        title="Events & Conferences"
        description="Connect in person and virtually through career panels, reunions, tech symposia, and workshop clinics."
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href={`${basePath}/events/my-events`}>My Registered Events</Link>
            </Button>
            {currentRole === 'SUPER_ADMIN' ? (
              <Button asChild size="sm">
                <Link href={`${basePath}/events/create`}>
                  <Plus size={14} /> Create Event
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      {actionNotice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      ) : null}

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search events by title, topic, speaker, or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'ALL', label: 'All Gatherings' },
            { id: 'ALUMNI_GALA', label: 'Galas & Reunions' },
            { id: 'CAREER', label: 'Career Panels' },
            { id: 'WORKSHOP', label: 'Hands-on Workshops' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events match your criteria"
          description="Check back soon for new campus conferences and workshop listings."
          action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setSearch('');
                setCategoryFilter('ALL');
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((ev) => (
            <article
              key={ev.id}
              className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col md:flex-row gap-5 items-start justify-between"
            >
              <div className="flex gap-4 items-start flex-1">
                {/* Date Badge */}
                <div className="flex flex-col items-center justify-center h-16 w-16 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 shrink-0 font-bold">
                  <span className="text-xl leading-none">{ev.day}</span>
                  <span className="text-[10px] tracking-wider uppercase mt-0.5">{ev.month}</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={ev.type === 'In person' ? 'success' : 'neutral'}>
                      {ev.type}
                    </Badge>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Clock size={12} /> {ev.time}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Users size={12} /> {ev.attendeesCount} Registered
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 m-0 hover:text-blue-600 transition-colors">
                    {ev.title}
                  </h3>

                  <p className="text-xs text-slate-500 flex items-center gap-1 m-0">
                    <MapPin size={12} className="text-slate-400" /> {ev.location}
                  </p>

                  <p className="text-xs text-slate-600 leading-relaxed pt-1 m-0">
                    {ev.description}
                  </p>

                  {ev.speaker ? (
                    <p className="text-[11px] text-blue-700 font-medium pt-1 m-0">
                      Keynote Speaker: <strong>{ev.speaker}</strong> ({ev.speakerRole})
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <Button
                  size="sm"
                  variant={ev.isRegistered ? 'secondary' : 'primary'}
                  onClick={() => handleRegister(ev.id, ev.title)}
                >
                  {ev.isRegistered ? 'Registered (Cancel)' : 'RSVP / Register'}
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`${basePath}/events/${ev.id}`}>
                    Details
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
