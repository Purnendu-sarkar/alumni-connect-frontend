'use client';

import { useQuery } from '@tanstack/react-query';
import { LogIn, Search, SlidersHorizontal, Users } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { AlumniCard } from '@/components/alumni/alumni-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

  const rawList = (query.data?.data && query.data.data.length > 0) ? query.data.data : demoAlumni;

  const alumni = useMemo(() => {
    return rawList.filter((person) => {
      const matchDept = department === 'All' || person.department?.toLowerCase().includes(department.toLowerCase()) || (person as any).role?.toLowerCase().includes(department.toLowerCase());
      const term = search.toLowerCase();
      const haystack = [person.name, person.currentCompany, person.position, ...(person.skills ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return matchDept && (!term || haystack.includes(term));
    });
  }, [rawList, search, department]);

  return (
    <section className="page-shell directory-page">
      <p className="eyebrow">THE VERIFIED DIRECTORY</p>
      <h1>Look up. Reach out. Move forward.</h1>
      <p className="lede">
        A living record of verified people from your university who are open to connecting.
      </p>

      {!user && (
        <div className="dashboard-note" style={{ margin: '1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>STUDENT & GRADUATE NETWORK</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'var(--muted)' }}>
              Sign in with your university account to send direct mentorship requests and view contact details.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button asChild size="sm">
              <Link href="/login"><LogIn size={14} /> Sign in</Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href="/register">Join now</Link>
            </Button>
          </div>
        </div>
      )}

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
