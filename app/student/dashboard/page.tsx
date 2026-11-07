'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Briefcase, Handshake, ArrowRight, Sparkles, Building2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';

export default function StudentDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Welcome Back</span>
            </div>
            <h1 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl tracking-tight">
              Hello, {user?.name ?? 'Student'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Department of {user?.department ?? 'Computer Science & Engineering'} • Verified Student
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/student/directory"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-blue-700 transition"
            >
              <span>Explore Directory</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Link
          href="/student/directory"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-blue-300 hover:shadow-md transition"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">Alumni Directory</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Search verified graduates by department, company, or professional industry.
          </p>
        </Link>

        <Link
          href="/student/jobs"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-blue-300 hover:shadow-md transition"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
            <Briefcase className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">Opportunities</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Apply to exclusive internships and career openings published by university alumni.
          </p>
        </Link>

        <Link
          href="/student/connections"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-blue-300 hover:shadow-md transition"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
            <Handshake className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">My Network</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Manage your incoming and outgoing connection requests and established mentorships.
          </p>
        </Link>
      </div>
    </div>
  );
}

