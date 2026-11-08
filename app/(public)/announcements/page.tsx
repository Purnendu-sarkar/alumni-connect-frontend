'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Calendar,
  Download,
  ExternalLink,
  FileText,
  Megaphone,
  Pin,
  Search,
  ShieldCheck,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionHeading } from '@/components/ui/section-heading';

interface Announcement {
  id: string;
  issueNo: string;
  title: string;
  department: string;
  category: 'Convocation' | 'Reunion' | 'Academic' | 'Career' | 'General';
  date: string;
  summary: string;
  isPinned?: boolean;
}

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    issueNo: 'CIRCULAR-2026-089',
    title: 'Registration Protocol for the 5th University Convocation Ceremony',
    department: 'Office of the University Registrar',
    category: 'Convocation',
    date: 'Oct 28, 2026',
    summary: 'Detailed instructions regarding graduate eligibility, convocation robe distribution schedules, guest passes, and photo session protocols for batches 2021 through 2024.',
    isPinned: true,
  },
  {
    id: 'ann-2',
    issueNo: 'CIRCULAR-2026-074',
    title: 'Grand Alumni Homecoming 2026: Campus Reunion & Dinner Passes',
    department: 'Alumni Relations Committee',
    category: 'Reunion',
    date: 'Oct 15, 2026',
    summary: 'Early bird registration is now open for the annual homecoming gathering. Featuring networking roundtables, department visits, and interactive panel sessions.',
    isPinned: true,
  },
  {
    id: 'ann-3',
    issueNo: 'CIRCULAR-2026-061',
    title: 'Alumni Industry Career Fair 2026 — Exclusive Student Registration',
    department: 'Career Services Center (CSC)',
    category: 'Career',
    date: 'Sep 30, 2026',
    summary: 'Over 25 alumni-founded tech firms and partner enterprises will conduct direct on-campus interviews for software engineering, embedded systems, and business analyst roles.',
  },
  {
    id: 'ann-4',
    issueNo: 'CIRCULAR-2026-049',
    title: 'Alumni Endowment Scholarship Fund for Undergraduate Research',
    department: 'Department of Computer Science & Engineering',
    category: 'Academic',
    date: 'Sep 12, 2026',
    summary: 'Applications are formally invited for the newly launched research grant funded by the North Western University Alumni Association.',
  },
];

export default function AnnouncementsPage() {
  const [category, setCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const categories = ['All', 'Convocation', 'Reunion', 'Career', 'Academic'];

  const filtered = ANNOUNCEMENTS.filter((item) => {
    const matchCat = category === 'All' || item.category === category;
    const matchSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <section className="page-shell" style={{ padding: '4rem 0' }}>
      <p className="eyebrow eyebrow--red">INSTITUTIONAL NOTICE BOARD</p>
      <h1>University & Alumni Announcements</h1>
      <p className="lede">
        Official administrative bulletins, convocation notices, alumni association directives, and campus career initiatives.
      </p>

      {/* Filter and Search Bar */}
      <div
        style={{
          margin: '3rem 0 2rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: '240px' }}>
          <Input
            placeholder="Search notices by keyword or title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                border: '2px solid var(--ink)',
                background: category === cat ? 'var(--ink)' : 'var(--paper)',
                color: category === cat ? 'var(--paper)' : 'var(--ink)',
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Pinned & Active Bulletins */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {filtered.map((item) => (
          <article
            key={item.id}
            style={{
              border: '2px solid var(--ink)',
              padding: '1.75rem',
              background: item.isPinned ? 'var(--surface)' : 'var(--paper)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {item.isPinned && (
                  <Badge variant="error">
                    <Pin size={12} style={{ display: 'inline', marginRight: '3px' }} /> Official Pinned Notice
                  </Badge>
                )}
                <Badge variant="neutral">{item.category}</Badge>
                <span style={{ fontSize: '0.75rem', color: 'var(--quiet)', fontFamily: 'monospace' }}>
                  {item.issueNo}
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>
                {item.date}
              </span>
            </div>

            <h2 style={{ fontSize: '1.45rem', margin: '0.25rem 0 0.5rem' }}>{item.title}</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--quiet)', fontWeight: 600 }}>
              Issued by: {item.department}
            </p>

            <p style={{ margin: '0.75rem 0 1.25rem', color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {item.summary}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--line)', paddingTop: '1rem' }}>
              <Button size="sm" variant="secondary">
                <FileText size={14} /> Read Full Circular
              </Button>
              <Button size="sm" variant="ghost">
                <Download size={14} /> Download PDF (Official Seal)
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
