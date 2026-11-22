'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Megaphone,
  Search,
  Filter,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionHeading } from '@/components/ui/section-heading';
import { EmptyState } from '@/components/dashboard/empty-state';
import { AnnouncementCard } from '@/components/announcements/announcement-card';
import { PublicWorkspaceBanner } from '@/components/public/public-workspace-banner';
import { getAnnouncements } from '@/lib/api/announcements.api';
import type { AnnouncementCategory } from '@/types/domain';

export default function AnnouncementsPage() {
  const [category, setCategory] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);

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
    queryKey: ['public-announcements', category, debouncedSearch, page],
    queryFn: () =>
      getAnnouncements({
        category: category !== 'ALL' ? (category as AnnouncementCategory) : undefined,
        q: debouncedSearch.trim() || undefined,
        page,
        limit: 12,
      }),
  });

  const announcements = responseData?.data || [];
  const meta = responseData?.meta;

  const categories = [
    { id: 'ALL', label: 'All Notices' },
    { id: 'GENERAL', label: 'General' },
    { id: 'ACADEMIC', label: 'Academic' },
    { id: 'CAREER', label: 'Career & Placement' },
    { id: 'EVENT', label: 'Campus Events' },
    { id: 'SECURITY_SYSTEM', label: 'Security & System' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
      <PublicWorkspaceBanner resource="announcements" />

      {/* Page Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold font-mono uppercase tracking-wider">
          <Megaphone size={14} /> Institutional Notice Board
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight m-0">
          Official University Circulars
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed m-0">
          Verified academic notices, convocation directives, alumni endowment initiatives, and administrative circulars published directly by university departments.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search circulars by keywords, topic, or department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-xs"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setCategory(cat.id);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              category === cat.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Announcements Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 bg-white rounded-xl border border-slate-200 space-y-3">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={Megaphone}
          title="Failed to load notices"
          description="Could not communicate with the bulletin server. Please try refreshing."
          action={
            <Button size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No notices found"
          description={
            debouncedSearch || category !== 'ALL'
              ? 'No announcements match your current filter selections.'
              : 'There are currently no active public announcements published.'
          }
          action={
            debouncedSearch || category !== 'ALL' ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setCategory('ALL');
                }}
              >
                Reset Filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {announcements.map((ann) => (
            <AnnouncementCard key={ann.id} announcement={ann} basePath="" />
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
