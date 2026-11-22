'use client';

import { Award, Briefcase, CalendarDays, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { PublicMetrics } from '@/lib/api/public.api';

interface TelemetryStripProps {
  metrics: PublicMetrics;
}

export function TelemetryStrip({ metrics }: TelemetryStripProps) {
  const telemetryItems = [
    {
      label: 'Verified Members',
      count: `${metrics.totalMembers.toLocaleString()}+`,
      subtext: `${metrics.studentsCount} Students · ${metrics.alumniCount} Alumni`,
      icon: Users,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      label: 'Curated Openings',
      count: `${metrics.publishedJobsCount.toLocaleString()}+`,
      subtext: 'Direct corporate & alumni referrals',
      icon: Briefcase,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Campus & Tech Events',
      count: `${metrics.publishedEventsCount.toLocaleString()}+`,
      subtext: 'Workshops, hackathons & meetups',
      icon: CalendarDays,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      label: 'Inspiring Stories',
      count: `${metrics.publishedStoriesCount.toLocaleString()}+`,
      subtext: 'Documented graduate journeys',
      icon: Award,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-4">
        {/* Real-Time Sync Indicator */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            LIVE DATABASE TELEMETRY · NORTH WESTERN UNIVERSITY
          </div>
          <span className="text-[11px] text-slate-600">
            Automated Redis cache-aside sync (5-minute TTL)
          </span>
        </div>

        {/* 4 Responsive Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {telemetryItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.label}
                className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold ${item.color}`}
                  >
                    <Icon size={24} />
                  </div>
                  <span className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {item.count}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 m-0">
                  {item.label}
                </h3>
                <p className="text-xs text-slate-600 mt-1 m-0">
                  {item.subtext}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
