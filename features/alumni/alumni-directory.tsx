'use client';

import { useQuery } from '@tanstack/react-query';
import { LogIn, Search, SlidersHorizontal, Users } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { AlumniCard } from '@/components/alumni/alumni-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionHeading } from '@/components/ui/section-heading';
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

  const rawList = query.data?.data ?? [];

  const alumni = useMemo(() => {
    return rawList.filter((person) => {
      const term = search.toLowerCase();
      const haystack = [person.name, person.currentCompany, person.position, ...(person.skills ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return !term || haystack.includes(term);
    });
  }, [rawList, search]);

  if (!user || !accessToken) {
    return (
      <section className="page-shell directory-page">
        <p className="eyebrow">THE VERIFIED DIRECTORY</p>
        <h1>Connect with your university alumni.</h1>
        <p className="lede">
          The verified alumni network is exclusive to enrolled students, alumni, and faculty.
        </p>

        <div className="dashboard-note" style={{ maxWidth: '640px', margin: '2rem 0' }}>
          <p className="eyebrow">MEMBERS ONLY</p>
          <h2>Sign in to search & connect.</h2>
          <p>
            Please sign in or create an account to view verified alumni profiles, send mentorship
            inquiries, and build professional connections.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Button asChild>
              <Link href="/login">
                <LogIn size={16} /> Sign in
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/register">Create profile</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell directory-page">
      <p className="eyebrow">THE VERIFIED DIRECTORY</p>
      <h1>Look up. Reach out. Move forward.</h1>
      <p className="lede">
        A living record of verified people from your university who are open to connecting.
      </p>

      <div className="directory-controls">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search names, companies, skills…"
          aria-label="Search alumni"
        />
        <div className="filter-row">
          <SlidersHorizontal size={17} />
          {['All', 'CSE', 'EEE', 'BBA', 'Civil', 'Economics'].map((item) => (
            <button
              key={item}
              className={department === item ? 'filter-chip filter-chip--selected' : 'filter-chip'}
              onClick={() => setDepartment(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {query.isLoading ? (
        <p className="empty-state">
          <Users size={24} /> Loading alumni network...
        </p>
      ) : query.isError ? (
        <div className="dashboard-note" style={{ borderLeft: '4px solid #ef4444' }}>
          <h2>Failed to load directory</h2>
          <p>Could not load the alumni directory from the server. Please try again.</p>
          <Button variant="secondary" onClick={() => query.refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          <SectionHeading
            eyebrow="VERIFIED NETWORK RESULTS"
            title={`${alumni.length} ${alumni.length === 1 ? 'member' : 'members'} found`}
          />
          <div className="alumni-grid">
            {alumni.map((alumnus) => (
              <AlumniCard key={alumnus.id} alumnus={alumnus} />
            ))}
          </div>
          {alumni.length === 0 ? (
            <p className="empty-state">
              <Search size={24} />
              No verified alumni match that search.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
