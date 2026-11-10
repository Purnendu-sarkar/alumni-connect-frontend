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
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
      {/* Page Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold font-mono uppercase tracking-wider">
          <Megaphone size={14} /> Institutional Notice Board
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight m-0">
          Official University Circulars
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed m-0">
          Official administrative bulletins, convocation notices, alumni association directives, and campus career initiatives.
        </p>
      </div>

      {/* Filter and Search Bar using shadcn Card */}
      <Card className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search notices by keyword, title, or circular number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </Card>

      {/* Bulletins List using shadcn Card */}
      <div className="space-y-6">
        {filtered.map((item) => (
          <Card
            key={item.id}
            className={`p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 space-y-4 ${
              item.isPinned ? 'border-blue-200 bg-blue-50/20' : ''
            }`}
          >
            <CardHeader className="p-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {item.isPinned && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Pin size={11} /> Pinned Notice
                    </Badge>
                  )}
                  <Badge variant="neutral">{item.category}</Badge>
                  <span className="text-[11px] font-mono text-slate-400">
                    {item.issueNo}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {item.date}
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-0 space-y-1.5">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug m-0">
                {item.title}
              </h2>
              <p className="text-xs font-semibold text-slate-500 m-0">
                Issued by: {item.department}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed m-0">
                {item.summary}
              </p>
            </CardContent>

            <CardFooter className="p-0 pt-4 border-t border-slate-100 flex items-center gap-3">
              <Button size="sm" variant="outline">
                <FileText size={13} /> View Circular Details
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => alert(`Downloading official PDF copy of ${item.issueNo}…`)}
              >
                <Download size={13} /> Official Seal PDF
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
