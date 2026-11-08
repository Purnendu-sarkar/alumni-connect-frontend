'use client';

import React from 'react';
import {
  FileCheck2,
  AlertTriangle,
  History,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { StatsCard, QuickActionCard } from '@/components/dashboard/cards';

export default function ModeratorDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
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
              Uphold institutional integrity, review submitted opportunities, and investigate member reports.
            </p>
          </div>
        </div>
      </div>

      {/* Moderation Queue Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          label="Job Review Queue"
          value="Queue"
          icon={FileCheck2}
          subtext="Pending career postings"
          href="/moderator/jobs"
          hrefLabel="Review jobs →"
          colorScheme="amber"
        />
        <StatsCard
          label="Flagged Content"
          value="Zero"
          icon={AlertTriangle}
          subtext="No active safety flags"
          href="/moderator/reports"
          hrefLabel="Check reports →"
          colorScheme="blue"
        />
        <StatsCard
          label="Moderation Actions"
          value="Logged"
          icon={History}
          subtext="Append-only record"
          href="/moderator/activity"
          hrefLabel="View history →"
          colorScheme="indigo"
        />
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <QuickActionCard
          title="Job Review Queue"
          description="Review, verify, or reject job and internship openings submitted by alumni before public distribution."
          icon={FileCheck2}
          href="/moderator/jobs"
          colorScheme="amber"
          badge="Priority"
        />
        <QuickActionCard
          title="Member Safety Reports"
          description="Investigate suspicious interactions, misattributed profiles, or community guideline infractions."
          icon={AlertTriangle}
          href="/moderator/reports"
          colorScheme="purple"
          badge="Safety"
        />
      </div>
    </div>
  );
}
