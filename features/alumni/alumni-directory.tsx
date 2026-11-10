'use client';

import { useQuery } from '@tanstack/react-query';
import { LogIn, Search, SlidersHorizontal, Users } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { AlumniCard } from '@/components/alumni/alumni-card';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { demoAlumni } from '@/features/shared/demo-data';
import { getAlumni } from '@/lib/api/alumni.api';
import { useAuthStore } from '@/store/auth-store';

export function AlumniDirectory() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  const query = useQuery({
    queryKey: ['alumni', accessToken, department],
    queryFn: () =>
      getAlumni(accessToken, {
        department: department === 'All' ? undefined : department,
      }),
    enabled: Boolean(accessToken),
  });

  const rawList = query.data?.data && query.data.data.length > 0 ? query.data.data : demoAlumni;

  const alumni = useMemo(() => {
    return rawList.filter((person) => {
      const matchDept =
        department === 'All' ||
        person.department?.toLowerCase().includes(department.toLowerCase()) ||
        (person as any).role?.toLowerCase().includes(department.toLowerCase());
      const term = search.toLowerCase();
      const haystack = [person.name, person.currentCompany, person.position, ...(person.skills ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return matchDept && (!term || haystack.includes(term));
    });
  }, [rawList, search, department]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold font-mono uppercase tracking-wider">
          <Users size={14} /> The Verified Directory
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight m-0">
          Look up. Reach out. Move forward.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed m-0">
          A living record of authenticated graduates from your university who are open to peer mentorship, technical advice, and campus referrals.
        </p>
      </div>

      {!user && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 font-mono">
              STUDENT & GRADUATE ACCESS
            </span>
            <p className="text-xs sm:text-sm text-slate-700 mt-1 m-0">
              Sign in with your university account to send direct mentorship requests and view contact details.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild size="sm">
              <Link href="/login">
                <LogIn size={14} /> Sign in
              </Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href="/register">Join Network</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alumni by name, employer, role, or technical skill…"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono hidden sm:inline mr-1">
            Faculty:
          </span>
          {['All', 'CSE', 'EEE', 'BBA', 'Civil', 'Economics'].map((item) => (
            <button
              key={item}
              onClick={() => setDepartment(item)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                department === item
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {query.isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <Users size={32} className="mx-auto text-blue-500 animate-pulse mb-3" />
          <p className="text-sm font-semibold m-0">Loading verified alumni network…</p>
        </div>
      ) : query.isError ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
          <h3 className="text-base font-bold text-rose-900 m-0">Failed to connect to directory</h3>
          <p className="text-xs text-rose-700 m-0">Could not retrieve the live directory from the campus server.</p>
          <Button variant="secondary" size="sm" onClick={() => query.refetch()}>
            Retry Query
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <SectionHeading
            eyebrow="VERIFIED NETWORK RESULTS"
            title={`${alumni.length} ${alumni.length === 1 ? 'Member' : 'Members'} Found`}
            description="Active alumni records in good standing."
          />

          {alumni.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900 m-0">No matching alumni found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto m-0">
                Try broadening your search term or selecting "All" under department filters.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setDepartment('All');
                }}
              >
                Clear Search & Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alumni.map((alumnus) => (
                <AlumniCard key={alumnus.id} alumnus={alumnus} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
