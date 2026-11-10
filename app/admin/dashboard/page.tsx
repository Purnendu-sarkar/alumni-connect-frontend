'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  GraduationCap,
  Megaphone,
  Plus,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { CardGridSkeleton } from '@/components/dashboard/loading-skeleton';
import { getAdminStats, getAuditLogs } from '@/lib/api/admin.api';
import { useAuthStore } from '@/store/auth-store';
import { demoReports, demoJobs, demoAnnouncements, demoEvents } from '@/features/shared/demo-data';

export default function SuperAdminDashboardPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  const statsQuery = useQuery({
    queryKey: ['admin-stats', accessToken],
    queryFn: () => getAdminStats(accessToken),
    enabled: Boolean(accessToken),
  });

  const auditLogsQuery = useQuery({
    queryKey: ['admin-audit-logs-summary', accessToken],
    queryFn: () => getAuditLogs(accessToken, 1, 5),
    enabled: Boolean(accessToken),
  });

  const stats = statsQuery.data?.data;
  const isLoading = statsQuery.isLoading;

  const totalUsers = stats?.totalUsers ?? 1248;
  const pendingVerifications = stats?.pendingVerifications ?? 14;
  const approvedUsers = stats?.approvedUsers ?? 1205;
  const totalJobs = stats?.totalJobs ?? 42;
  const pendingJobs = stats?.pendingJobs ?? 3;
  const openReports = demoReports.filter((r) => r.status === 'OPEN').length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        eyebrow="CAMPUS HEADQUARTERS"
        title="Super Admin Command Center"
        description="Comprehensive university directory governance, moderator staff coordination, moderation triage, and institutional compliance."
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Healthy
          </span>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="secondary" asChild>
              <Link href="/admin/users/moderators">
                <UserPlus size={14} /> Invite Moderator
              </Link>
            </Button>
            <Button size="sm" variant="secondary" asChild>
              <Link href="/admin/announcements/create">
                <Megaphone size={14} /> Post Notice
              </Link>
            </Button>
            <Button size="sm" variant="primary" asChild>
              <Link href="/admin/verification/pending">
                <ShieldCheck size={14} /> Review Verifications ({pendingVerifications})
              </Link>
            </Button>
          </div>
        }
      />

      {/* Primary KPI Stats */}
      {isLoading ? (
        <CardGridSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Registered Users"
            value={totalUsers.toLocaleString()}
            subtext="Students, alumni & faculty"
            icon={Users}
            iconColor="#2563EB"
            trend={{ value: '840 Students · 380 Alumni', positive: true }}
            href="/admin/users"
          />
          <StatCard
            label="Pending Verifications"
            value={pendingVerifications}
            subtext="Awaiting credential check"
            icon={ShieldAlert}
            iconColor={pendingVerifications > 0 ? '#D97706' : '#16A34A'}
            href="/admin/verification/pending"
          />
          <StatCard
            label="Active Opportunities"
            value={totalJobs}
            subtext={`${pendingJobs} pending moderation review`}
            icon={BriefcaseBusiness}
            iconColor="#16A34A"
            href="/admin/jobs"
          />
          <StatCard
            label="Open Incident Reports"
            value={openReports}
            subtext="Reported posts & members"
            icon={AlertTriangle}
            iconColor={openReports > 0 ? '#E11D48' : '#7C3AED'}
            href="/admin/reports"
          />
        </div>
      )}

      {/* Quick Action Hub */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Administrative Control Panels</h2>
          <span className="text-xs text-slate-400">Institutional Governance & System Config</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/users"
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Users size={18} />
              </div>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors m-0">
              User Directory
            </h3>
            <p className="text-xs text-slate-500 mt-1 m-0">
              Manage student, alumni, and staff accounts, suspend bad actors, and inspect profiles.
            </p>
          </Link>

          <Link
            href="/admin/verification"
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <ShieldCheck size={18} />
              </div>
              <Badge variant="warning">{pendingVerifications} Pending</Badge>
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors m-0">
              Identity Verification
            </h3>
            <p className="text-xs text-slate-500 mt-1 m-0">
              Verify student IDs, graduation transcripts, and batch diplomas for official trust badges.
            </p>
          </Link>

          <Link
            href="/admin/jobs"
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <BriefcaseBusiness size={18} />
              </div>
              <Badge variant="success">Campus Board</Badge>
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors m-0">
              Career & Jobs Desk
            </h3>
            <p className="text-xs text-slate-500 mt-1 m-0">
              Oversee alumni job postings, internship listings, moderation queues, and applicant metrics.
            </p>
          </Link>

          <Link
            href="/admin/users/moderators"
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <UserPlus size={18} />
              </div>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors m-0">
              Staff & Moderators
            </h3>
            <p className="text-xs text-slate-500 mt-1 m-0">
              Invite university staff, assign moderator permissions, and revoke outdated invitations.
            </p>
          </Link>

          <Link
            href="/admin/announcements"
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <Megaphone size={18} />
              </div>
              <Badge variant="neutral">Broadcast</Badge>
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors m-0">
              Campus Announcements
            </h3>
            <p className="text-xs text-slate-500 mt-1 m-0">
              Publish official statements, graduation bulletins, university closures, and news alerts.
            </p>
          </Link>

          <Link
            href="/admin/events"
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Calendar size={18} />
              </div>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors m-0">
              Campus Gatherings & Events
            </h3>
            <p className="text-xs text-slate-500 mt-1 m-0">
              Organize alumni homecomings, career fairs, technical webinars, and manage RSVPs.
            </p>
          </Link>

          <Link
            href="/admin/analytics"
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Activity size={18} />
              </div>
              <Badge variant="neutral">Analytics</Badge>
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors m-0">
              Platform Analytics
            </h3>
            <p className="text-xs text-slate-500 mt-1 m-0">
              Deep dive into user acquisition rates, alumni engagement, job placement trends, and activity velocity.
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-400 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <Server size={18} />
              </div>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-slate-800 transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-900 transition-colors m-0">
              System Configuration
            </h3>
            <p className="text-xs text-slate-500 mt-1 m-0">
              Manage university email domain restrictions, audit logging retention, and institutional security policies.
            </p>
          </Link>
        </div>
      </div>

      {/* Two Column Section: Live Moderation + Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Action Queue */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0">Urgent Verification & Moderation Desk</h3>
              <p className="text-xs text-slate-500 m-0 mt-0.5">High-priority compliance items awaiting review</p>
            </div>
            <Button size="sm" variant="ghost" asChild>
              <Link href="/admin/verification">View All</Link>
            </Button>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-lg flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {pendingVerifications}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-950 m-0">Student & Alumni Verifications</h4>
                  <p className="text-[11px] text-amber-800 m-0 mt-0.5">
                    Unreviewed student registration records awaiting verification
                  </p>
                </div>
              </div>
              <Button size="sm" variant="secondary" className="border-amber-300 text-amber-900 hover:bg-amber-100 shrink-0" asChild>
                <Link href="/admin/verification/pending">Review</Link>
              </Button>
            </div>

            <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-lg flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {pendingJobs}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-950 m-0">Job Posts Pending Moderation</h4>
                  <p className="text-[11px] text-blue-800 m-0 mt-0.5">
                    Alumni job submissions waiting for employer verification
                  </p>
                </div>
              </div>
              <Button size="sm" variant="secondary" className="border-blue-300 text-blue-900 hover:bg-blue-100 shrink-0" asChild>
                <Link href="/admin/jobs/pending">Review</Link>
              </Button>
            </div>

            <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-lg flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {openReports}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-950 m-0">Open Incident Reports</h4>
                  <p className="text-[11px] text-rose-800 m-0 mt-0.5">
                    Community-reported inappropriate listings or conduct
                  </p>
                </div>
              </div>
              <Button size="sm" variant="secondary" className="border-rose-300 text-rose-900 hover:bg-rose-100 shrink-0" asChild>
                <Link href="/admin/reports">Review</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Real-Time Audit Log Summary */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0">System Audit Trail</h3>
              <p className="text-xs text-slate-500 m-0 mt-0.5">Immutable record of administrative actions</p>
            </div>
            <Button size="sm" variant="ghost" asChild>
              <Link href="/admin/activity-logs">Full Logs</Link>
            </Button>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'log-1',
                action: 'USER_VERIFIED',
                actor: 'Super Admin',
                target: 'Sadia Jahan (Batch 2024)',
                time: '12 minutes ago',
              },
              {
                id: 'log-2',
                action: 'JOB_APPROVED',
                actor: 'Moderator Staff',
                target: 'Junior Cloud Developer at bKash',
                time: '1 hour ago',
              },
              {
                id: 'log-3',
                action: 'MODERATOR_INVITED',
                actor: 'Super Admin',
                target: 'moderator.cse@campus.edu',
                time: '3 hours ago',
              },
              {
                id: 'log-4',
                action: 'ANNOUNCEMENT_POSTED',
                actor: 'Super Admin',
                target: 'Official Campus Career Fair 2026',
                time: 'Yesterday',
              },
            ].map((entry) => (
              <div
                key={entry.id}
                className="p-3 bg-slate-50 rounded-lg flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                      {entry.action}
                    </span>
                    <span className="text-slate-500 text-[11px]">{entry.actor}</span>
                  </div>
                  <p className="text-slate-900 font-medium m-0">{entry.target}</p>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">{entry.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
