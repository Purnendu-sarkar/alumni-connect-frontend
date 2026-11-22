'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  AlertOctagon,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  GraduationCap,
  Handshake,
  Layers,
  LineChart,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { CardGridSkeleton } from '@/components/dashboard/loading-skeleton';
import { getAdminStats, type AdminStats, type DepartmentMetric } from '@/lib/api/admin.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface AdminAnalyticsViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function AdminAnalyticsView({ currentRole, basePath }: AdminAnalyticsViewProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isExporting, setIsExporting] = useState(false);

  const statsQuery = useQuery({
    queryKey: ['admin-stats', accessToken],
    queryFn: () => getAdminStats(accessToken),
    enabled: Boolean(accessToken),
  });

  const stats = statsQuery.data?.data;

  // Percentage calculations
  const totalUsers = stats?.totalUsers || 1;
  const students = stats?.totalStudents || 0;
  const alumni = stats?.totalAlumni || 0;
  const moderators = stats?.totalModerators || 0;
  const admins = stats?.totalAdmins || 0;

  const studentPct = Math.round((students / totalUsers) * 100);
  const alumniPct = Math.round((alumni / totalUsers) * 100);
  const moderatorPct = Math.max(1, Math.round((moderators / totalUsers) * 100));
  const adminPct = Math.max(1, Math.round((admins / totalUsers) * 100));

  // Verification funnel numbers
  const registeredCount = stats?.registeredCount ?? (students + alumni);
  const emailVerifiedCount = stats?.emailVerifiedCount ?? stats?.approvedUsers ?? 0;
  const adminVerifiedCount = stats?.adminVerifiedCount ?? stats?.approvedUsers ?? 0;
  const pendingVerifications = stats?.pendingVerifications ?? 0;

  const emailVerifiedPct = registeredCount > 0 ? Math.round((emailVerifiedCount / registeredCount) * 100) : 0;
  const adminVerifiedPct = registeredCount > 0 ? Math.round((adminVerifiedCount / registeredCount) * 100) : 0;

  // CSV Export Generator
  const handleExportCsv = () => {
    if (!stats) return;
    setIsExporting(true);

    try {
      const rows: string[][] = [
        ['ALUMNI CONNECT PLATFORM ANALYTICS EXPORT'],
        [`Export Timestamp: ${new Date().toISOString()}`],
        [`Institution: North Western University (nwu.ac.bd)`],
        [],
        ['EXECUTIVE KPI SUMMARY'],
        ['Metric', 'Value', 'Details'],
        ['Total Registered Users', String(stats.totalUsers), 'All campus roles'],
        ['Enrolled Students', String(stats.totalStudents), `${studentPct}% of user base`],
        ['Accredited Alumni', String(stats.totalAlumni), `${alumniPct}% of user base`],
        ['Faculty Moderators', String(stats.totalModerators), `${moderatorPct}% of staff`],
        ['Super Administrators', String(stats.totalAdmins), 'Governance root'],
        ['Approved / Accredited Members', String(stats.approvedUsers), `${adminVerifiedPct}% verified`],
        ['Pending Verifications', String(stats.pendingVerifications), 'In moderator queue'],
        ['Suspended Accounts', String(stats.suspendedUsers ?? 0), 'Access restricted'],
        [],
        ['VERIFICATION FUNNEL'],
        ['Stage', 'Count', 'Conversion Rate'],
        ['1. Registered Accounts', String(registeredCount), '100% baseline'],
        ['2. Email OTP Verified', String(emailVerifiedCount), `${emailVerifiedPct}% conversion`],
        ['3. Admin Accredited Members', String(adminVerifiedCount), `${adminVerifiedPct}% accredited`],
        ['Pending Moderator Review', String(pendingVerifications), 'Active queue backlog'],
        [],
        ['NETWORK & MENTORSHIP VELOCITY'],
        ['Metric', 'Value', 'Status / Category'],
        ['Total Connection Requests', String(stats.totalConnections ?? 0), '1-on-1 network graph'],
        ['Accepted Connections', String(stats.acceptedConnections ?? 0), 'Active pairings'],
        ['Pending Connections', String(stats.pendingConnections ?? 0), 'Awaiting response'],
        ['Total Mentorship Inquiries', String(stats.totalMentorships ?? 0), 'Mentorship pairings'],
        ['Active Mentorships', String(stats.activeMentorships ?? 0), 'In progress'],
        ['Completed Mentorships', String(stats.completedMentorships ?? 0), 'Successfully concluded'],
        ['Pending Mentorship Requests', String(stats.pendingMentorships ?? 0), 'Awaiting mentor decision'],
        [],
        ['CAREER & MODERATION METRICS'],
        ['Metric', 'Value', 'Details'],
        ['Published Job Postings', String(stats.publishedJobs ?? stats.totalJobs), 'Active on board'],
        ['Pending Review Jobs', String(stats.pendingReviewJobs ?? stats.pendingJobs), 'Moderator queue'],
        ['Closed / Filled Jobs', String(stats.closedJobs ?? 0), 'Archived vacancies'],
        ['Total Job Applications', String(stats.totalApplications ?? 0), 'Student submissions'],
        ['Shortlisted Applications', String(stats.shortlistedApplications ?? 0), 'Candidates advanced'],
        ['Accepted Applications', String(stats.acceptedApplications ?? 0), 'Hires confirmed'],
        ['Open Content Reports', String(stats.openReports ?? 0), 'Integrity queue'],
        ['Resolved Content Reports', String(stats.resolvedReports ?? 0), 'Moderation cleared'],
        ['Security Audit Logs', String(stats.totalAuditLogs ?? stats.auditLogsCount), 'Immutable events'],
        [],
        ['DEPARTMENTAL CAMPUS DISTRIBUTION'],
        ['Department Name', 'Code', 'Students', 'Alumni', 'Total Members', 'Student / Alumni Ratio'],
      ];

      if (stats.departmentBreakdown && stats.departmentBreakdown.length > 0) {
        for (const dept of stats.departmentBreakdown) {
          const ratio = dept.alumni > 0 ? `${(dept.students / dept.alumni).toFixed(2)} : 1` : 'N/A';
          rows.push([
            dept.department,
            dept.code || 'DEPT',
            String(dept.students),
            String(dept.alumni),
            String(dept.total),
            ratio,
          ]);
        }
      }

      const csvContent = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `alumni-connect-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CAMPUS DATA INTELLIGENCE"
        title="Platform Analytics & Health Metrics"
        description="Comprehensive real-time metrics on institutional enrollment, verification funnels, network pairings, and departmental distribution."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={isExporting || statsQuery.isFetching || !stats}
            >
              <Download size={13} className={isExporting ? 'animate-bounce' : ''} />
              {isExporting ? 'Generating CSV…' : 'Export CSV'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => statsQuery.refetch()}
              disabled={statsQuery.isFetching}
            >
              <RefreshCw size={13} className={statsQuery.isFetching ? 'animate-spin' : ''} />
              Refresh Analytics
            </Button>
          </div>
        }
      />

      {/* 1. Primary Executive KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Registered Users"
          value={stats?.totalUsers ?? '…'}
          icon={Users}
          iconColor="#2563EB"
          subtext="Enrolled across all cohorts"
          trend={{ value: `${students} Students · ${alumni} Alumni`, positive: true }}
        />
        <StatCard
          label="Pending Verifications"
          value={stats?.pendingVerifications ?? '…'}
          icon={Clock}
          iconColor="#D97706"
          subtext="Awaiting moderator review"
          href={`${basePath}/verification/pending`}
          actionLabel="Open Queue"
        />
        <StatCard
          label="Accredited Members"
          value={stats?.approvedUsers ?? '…'}
          icon={UserCheck}
          iconColor="#16A34A"
          subtext="Verified university alumni"
          trend={{ value: `${adminVerifiedPct}% Accredited`, positive: true }}
        />
        <StatCard
          label="Active Connections"
          value={stats?.acceptedConnections ?? '…'}
          icon={Handshake}
          iconColor="#7C3AED"
          subtext={`${stats?.pendingConnections ?? 0} connection requests pending`}
          href={`${basePath}/connections`}
          actionLabel="View Network"
        />
      </div>

      {statsQuery.isLoading ? (
        <CardGridSkeleton count={4} />
      ) : (
        <>
          {/* 2. Role Distribution & Verification Funnel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Role Distribution Card */}
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 m-0">Institutional Role Distribution</h3>
                  <p className="text-xs text-slate-500 m-0">Live composition of the campus network</p>
                </div>
                <Users size={18} className="text-blue-600" />
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-800">Enrolled Students</span>
                    <span className="text-slate-600 font-mono">
                      {studentPct}% ({students.toLocaleString()} Members)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${studentPct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-800">Accredited Alumni</span>
                    <span className="text-slate-600 font-mono">
                      {alumniPct}% ({alumni.toLocaleString()} Members)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${alumniPct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-800">Faculty Moderators</span>
                    <span className="text-slate-600 font-mono">
                      {moderatorPct}% ({moderators.toLocaleString()} Staff)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(2, moderatorPct)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-800">Super Administrators</span>
                    <span className="text-slate-600 font-mono">
                      {adminPct}% ({admins.toLocaleString()} Administrators)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(2, adminPct)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Verification Funnel */}
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 m-0">Member Accreditation Funnel</h3>
                  <p className="text-xs text-slate-500 m-0">Registration to verified credential pipeline</p>
                </div>
                <ShieldCheck size={18} className="text-emerald-600" />
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px]">
                      1
                    </span>
                    <div>
                      <p className="font-bold text-slate-800 m-0">Registered Profiles</p>
                      <p className="text-[11px] text-slate-500 m-0">Total students and alumni created</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 font-mono">{registeredCount}</span>
                    <span className="block text-[10px] text-slate-400">100% baseline</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[11px]">
                      2
                    </span>
                    <div>
                      <p className="font-bold text-slate-800 m-0">Institutional Email Verified</p>
                      <p className="text-[11px] text-slate-500 m-0">Completed campus OTP verification</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 font-mono">{emailVerifiedCount}</span>
                    <span className="block text-[10px] text-emerald-600 font-semibold">{emailVerifiedPct}% conversion</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[11px]">
                      3
                    </span>
                    <div>
                      <p className="font-bold text-slate-800 m-0">Fully Accredited Members</p>
                      <p className="text-[11px] text-slate-500 m-0">Approved for full campus directory access</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 font-mono">{adminVerifiedCount}</span>
                    <span className="block text-[10px] text-purple-600 font-semibold">{adminVerifiedPct}% accredited</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Network, Mentorship & Career Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Network Connections */}
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 m-0">1-on-1 Social Graph</h3>
                  <p className="text-xs text-slate-500 m-0">Peer connection activity</p>
                </div>
                <Handshake size={18} className="text-blue-600" />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-600">Total Connections Initiated</span>
                  <span className="font-bold text-slate-900 font-mono">{stats?.totalConnections ?? 0}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-600">Accepted Pairings</span>
                  <span className="font-bold text-emerald-600 font-mono">{stats?.acceptedConnections ?? 0}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-600">Pending Inquiries</span>
                  <span className="font-bold text-amber-600 font-mono">{stats?.pendingConnections ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Mentorship Program */}
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 m-0">Mentorship Program</h3>
                  <p className="text-xs text-slate-500 m-0">Student-alumni pairings</p>
                </div>
                <GraduationCap size={18} className="text-purple-600" />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-600">Total Mentorship Requests</span>
                  <span className="font-bold text-slate-900 font-mono">{stats?.totalMentorships ?? 0}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-600">Active Mentorships</span>
                  <span className="font-bold text-emerald-600 font-mono">{stats?.activeMentorships ?? 0}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-600">Completed Engagements</span>
                  <span className="font-bold text-purple-600 font-mono">{stats?.completedMentorships ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Career Board Pipeline */}
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 m-0">Career Board Pipeline</h3>
                  <p className="text-xs text-slate-500 m-0">Applications & vacancies</p>
                </div>
                <BriefcaseBusiness size={18} className="text-indigo-600" />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-600">Published Vacancies</span>
                  <span className="font-bold text-slate-900 font-mono">{stats?.publishedJobs ?? stats?.totalJobs ?? 0}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-600">Applications Submitted</span>
                  <span className="font-bold text-blue-600 font-mono">{stats?.totalApplications ?? 0}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-600">Candidates Shortlisted</span>
                  <span className="font-bold text-emerald-600 font-mono">{stats?.shortlistedApplications ?? 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Departmental Campus Distribution */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
                  <Building2 size={16} className="text-blue-600" />
                  Departmental Campus Distribution
                </h3>
                <p className="text-xs text-slate-500 m-0 mt-0.5">
                  Live enrollment and accredited alumni breakdown by academic faculty
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {stats?.departmentBreakdown?.length ?? 0} Academic Departments
              </span>
            </div>

            {stats?.departmentBreakdown && stats.departmentBreakdown.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {stats.departmentBreakdown.map((dept: DepartmentMetric) => {
                  const maxDeptTotal = Math.max(
                    ...stats.departmentBreakdown!.map((d) => d.total),
                    1,
                  );
                  const barPct = Math.round((dept.total / maxDeptTotal) * 100);
                  const studentShare = dept.total > 0 ? Math.round((dept.students / dept.total) * 100) : 0;
                  const alumniShare = dept.total > 0 ? Math.round((dept.alumni / dept.total) * 100) : 0;

                  return (
                    <div
                      key={dept.department}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{dept.department}</span>
                          <span className="text-[10px] text-slate-400 font-mono font-semibold uppercase">
                            Code: {dept.code || 'DEPT'}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 font-mono">
                          {dept.total.toLocaleString()} Members
                        </span>
                      </div>

                      {/* Split Bar */}
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-blue-600"
                          style={{ width: `${studentShare}%` }}
                          title={`Students: ${dept.students}`}
                        />
                        <div
                          className="h-full bg-emerald-600"
                          style={{ width: `${alumniShare}%` }}
                          title={`Alumni: ${dept.alumni}`}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-blue-600" />
                          Students: <strong className="text-slate-800">{dept.students}</strong> ({studentShare}%)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-600" />
                          Alumni: <strong className="text-slate-800">{dept.alumni}</strong> ({alumniShare}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                No departmental distributions recorded for this institution.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
