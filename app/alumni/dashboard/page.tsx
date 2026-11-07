'use client';

import React from 'react';
import Link from 'next/link';
import { PlusCircle, Briefcase, Users, Handshake, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';

export default function AlumniDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Alumni Portal</span>
            </div>
            <h1 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl tracking-tight">
              Welcome, {user?.name ?? 'Alumnus'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {user?.department ?? 'Alumni Community'} • Verified Graduate
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/alumni/jobs/create"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-emerald-700 transition"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post Opportunity</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Link
          href="/alumni/jobs/create"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-emerald-300 hover:shadow-md transition"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
            <PlusCircle className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">Post a Job / Internship</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Publish career openings directly to motivated university students and graduates.
          </p>
        </Link>

        <Link
          href="/alumni/my-jobs"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-emerald-300 hover:shadow-md transition"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
            <Briefcase className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">My Job Listings</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Review status of submitted postings and manage incoming student applications.
          </p>
        </Link>

        <Link
          href="/alumni/directory"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-emerald-300 hover:shadow-md transition"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">Alumni Directory</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Find and reconnect with classmates and colleagues across global organizations.
          </p>
        </Link>
      </div>
    </div>
  );
}

