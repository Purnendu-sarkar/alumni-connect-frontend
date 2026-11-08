'use client';

import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

import { AlumniCard } from '@/components/alumni/alumni-card';
import { DirectoryGridSkeleton } from '@/components/shared/skeletons';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { SearchInput } from '@/components/shared/search-input';
import { getAlumni } from '@/lib/api/alumni.api';
import { useAuth } from '@/lib/hooks/use-auth';

export function AlumniDirectory() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const { user, isLoading: authLoading } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['directory', department, search],
    queryFn: () =>
      getAlumni({
        department: department === 'All' ? undefined : department,
        search: search || undefined,
      }),
    enabled: Boolean(user),
  });

  if (authLoading) {
    return <DirectoryGridSkeleton count={8} />;
  }

  if (!user) {
    return (
      <div className="py-12 text-center">
        <EmptyState
          title="Sign in required"
          description="The alumni directory is private to verified students, alumni, and faculty."
          actionLabel="Sign In"
          onAction={() => {
            window.location.href = '/login';
          }}
        />
      </div>
    );
  }

  const alumniList = data?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Search and Department Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-md">
          <SearchInput
            placeholder="Search alumni by name, role, skills..."
            onSearch={setSearch}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0" />
          {['All', 'Computer Science', 'Business', 'Engineering', 'Economics'].map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setDepartment(dept)}
              className={`rounded-full px-3 py-1 font-medium transition ${
                department === dept
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <DirectoryGridSkeleton count={8} />
      ) : isError ? (
        <ErrorState
          title="Failed to load alumni directory"
          message="Could not connect to the network service. Please check your connection and retry."
          onRetry={() => refetch()}
        />
      ) : alumniList.length === 0 ? (
        <EmptyState
          title="No alumni found"
          description={
            search
              ? `No alumni matching "${search}". Try adjusting your search or filters.`
              : 'The directory currently has no members listed for this criteria.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {alumniList.map((alumnus) => (
            <AlumniCard key={alumnus.id} alumnus={alumnus} />
          ))}
        </div>
      )}
    </div>
  );
}
