'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';
import { AnnouncementCard } from '@/components/announcements/announcement-card';
import { getAnnouncements } from '@/lib/api/announcements.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole, AnnouncementCategory } from '@/types/domain';

interface AnnouncementsListViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function AnnouncementsListView({
  currentRole,
  basePath,
}: AnnouncementsListViewProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);

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
    queryKey: ['announcements', currentRole, categoryFilter, debouncedSearch, page],
    queryFn: async () => {
      const res = await getAnnouncements(
        {
          category: categoryFilter !== 'ALL' ? (categoryFilter as AnnouncementCategory) : undefined,
          q: debouncedSearch.trim() || undefined,
          page,
          limit: 12,
        },
        accessToken
      );
      return res;
    },
  });

  const announcements = responseData?.data || [];
  const meta = responseData?.meta;

  const categories = [
    { id: 'ALL', label: 'All Notices' },
    { id: 'GENERAL', label: 'General' },
    { id: 'ACADEMIC', label: 'Academic' },
    { id: 'CAREER', label: 'Career & Jobs' },
    { id: 'EVENT', label: 'Campus Events' },
    { id: 'SECURITY_SYSTEM', label: 'Security & System' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="OFFICIAL NOTICES & BULLETIN"
        title="Institutional Announcements"
        description="Official campus notices, verification deadlines, university advisories, and alumni initiatives."
        actions={
          currentRole === 'SUPER_ADMIN' ? (
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
              <Link href={`${basePath}/announcements/create`}>
                <Plus size={14} className="mr-1" /> Publish Announcement
              </Link>
            </Button>
          ) : null
        }
      />

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search announcements by keywords, advisory topics, or department…"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          title="Failed to load announcements"
          description="Could not communicate with the notification server. Please try refreshing."
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
            debouncedSearch || categoryFilter !== 'ALL'
              ? 'No announcements match your current filter selections.'
              : 'There are currently no active institutional notices published.'
          }
          action={
            debouncedSearch || categoryFilter !== 'ALL' ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('ALL');
                }}
              >
                Reset Filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {announcements.map((ann) => (
            <AnnouncementCard
              key={ann.id}
              announcement={ann}
              basePath={basePath}
            />
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
