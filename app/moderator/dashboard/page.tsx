'use client';

import React from 'react';
import Link from 'next/link';
import { FileCheck2, AlertTriangle, History, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';

export default function ModeratorDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Moderation Workbench</span>
            </div>
            <h1 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl tracking-tight">
              Review Desk: {user?.name ?? 'Moderator'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Ensure platform postings, reports, and member interactions meet community standards.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Link
          href="/moderator/jobs"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-amber-300 hover:shadow-md transition"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
            <FileCheck2 className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">Job Review Queue</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Review pending job and internship postings submitted by alumni before publication.
          </p>
        </Link>

        <Link
          href="/moderator/reports"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-amber-300 hover:shadow-md transition"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">Member Reports</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Investigate flagged profiles, messages, or suspicious listings submitted by students.
          </p>
        </Link>
      </div>
    </div>
  );
}

