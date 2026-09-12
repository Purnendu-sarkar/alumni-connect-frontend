'use client';

import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';

import { AlumniCard } from '@/components/alumni/alumni-card';
import { Input } from '@/components/ui/input';
import { SectionHeading } from '@/components/ui/section-heading';
import { getAlumni } from '@/lib/api/alumni.api';
import { useAuthStore } from '@/store/auth-store';
import { demoAlumni } from '@/features/shared/demo-data';

export function AlumniDirectory() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const accessToken = useAuthStore((state) => state.accessToken);
  const query = useQuery({ queryKey: ['alumni', accessToken], queryFn: () => getAlumni(accessToken) });
  const source = query.data?.data?.length ? query.data.data : demoAlumni;
  const alumni = useMemo(
    () =>
      source.filter((person) => {
        const term = search.toLowerCase();
        const haystack = [person.name, person.currentCompany, person.position, ...person.skills]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return (
          (!term || haystack.includes(term)) &&
          (department === 'All' || person.department?.toLowerCase().includes(department.toLowerCase()))
        );
      }),
    [source, search, department],
  );

  return (
    <section className="page-shell directory-page">
      <p className="eyebrow">THE VERIFIED DIRECTORY</p>
      <h1>Look up. Reach out. Move forward.</h1>
      <p className="lede">A living record of people from your university who are willing to open a door.</p>
      <div className="directory-controls">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search names, companies, skills…" aria-label="Search alumni" />
        <div className="filter-row"><SlidersHorizontal size={17} />{['All', 'CSE', 'Business', 'EEE'].map((item) => <button key={item} className={department === item ? 'filter-chip filter-chip--selected' : 'filter-chip'} onClick={() => setDepartment(item)}>{item}</button>)}</div>
      </div>
      <SectionHeading eyebrow={query.isError ? 'CURATED PREVIEW' : 'NETWORK RESULTS'} title={`${alumni.length} people to meet`} />
      <div className="alumni-grid">{alumni.map((alumnus) => <AlumniCard key={alumnus.id} alumnus={alumnus} />)}</div>
      {alumni.length === 0 ? <p className="empty-state"><Search size={24} />No alumni match that search yet.</p> : null}
    </section>
  );
}
