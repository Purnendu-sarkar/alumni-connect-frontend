'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  CalendarDays,
  Plus,
  Search,
  Filter,
  Sparkles,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';
import { EventCard } from '@/components/events/event-card';
import { getEvents } from '@/lib/api/events.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole, EventMode } from '@/types/domain';

interface EventsListViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function EventsListView({ currentRole, basePath }: EventsListViewProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [modeFilter, setModeFilter] = useState<EventMode | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  // 300ms Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['events', currentRole, tab, categoryFilter, modeFilter, debouncedSearch, page],
    queryFn: async () => {
      const res = await getEvents(
        {
          tab,
          category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
          mode: modeFilter !== 'ALL' ? modeFilter : undefined,
          q: debouncedSearch.trim() || undefined,
          page,
          limit: 12,
        },
        accessToken
      );
      return res;
    },
  });

  const events = responseData?.data || [];
  const meta = responseData?.meta;

  const categories = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'CAREER', label: 'Career Panels' },
    { id: 'ACADEMIC', label: 'Academic & Tech' },
    { id: 'ALUMNI_GALA', label: 'Galas & Reunions' },
    { id: 'WORKSHOP', label: 'Workshops' },
    { id: 'GENERAL', label: 'General' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CAMPUS & ALUMNI GATHERINGS"
        title="Events & Conferences"
        description="Connect in person and virtually through career panels, reunions, tech symposia, and workshop clinics."
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`${basePath}/events/my-events`}>My Registered Events</Link>
            </Button>
            {currentRole === 'SUPER_ADMIN' ? (
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                <Link href={`${basePath}/events/create`}>
                  <Plus size={14} className="mr-1" /> Create Event
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      {/* Tabs Bar */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => {
              setTab('upcoming');
              setPage(1);
            }}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              tab === 'upcoming'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Upcoming Events
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('past');
              setPage(1);
            }}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              tab === 'past'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Past Gatherings
          </button>
        </div>

        {meta && meta.total > 0 && (
          <span className="text-xs text-slate-500 font-medium pb-3 hidden sm:inline">
            Showing {events.length} of {meta.total} events
          </span>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search events by title, topic, speaker, or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Dropdown */}
          <select
            value={modeFilter}
            onChange={(e) => {
              setModeFilter(e.target.value as EventMode | 'ALL');
              setPage(1);
            }}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Modes</option>
            <option value="IN_PERSON">In Person</option>
            <option value="ONLINE">Online Session</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setCategoryFilter(cat.id);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              categoryFilter === cat.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white">
              <Skeleton className="h-44 w-full rounded-lg" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={Calendar}
          title="Failed to load events"
          description="There was an error communicating with the server. Please try refreshing."
          action={
            <Button size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={tab === 'upcoming' ? 'No upcoming events found' : 'No past gatherings found'}
          description={
            debouncedSearch || categoryFilter !== 'ALL' || modeFilter !== 'ALL'
              ? 'No events match your current filter selections. Try clearing your filters.'
              : tab === 'upcoming'
              ? 'There are currently no scheduled upcoming events. Check back soon for new announcements!'
              : 'No past events found in the institutional archive.'
          }
          action={
            debouncedSearch || categoryFilter !== 'ALL' || modeFilter !== 'ALL' ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('ALL');
                  setModeFilter('ALL');
                }}
              >
                Reset Filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} basePath={basePath} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-xs font-semibold text-slate-600 px-2">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
