'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Key,
  Minus,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardGridSkeleton, TableSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { getAdminRolesOverview } from '@/lib/api/admin.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface AdminRolesViewProps {
  basePath?: string;
}

const ROLE_ORDER: UserRole[] = ['STUDENT', 'ALUMNI', 'MODERATOR', 'SUPER_ADMIN'];

export function AdminRolesView({ basePath = '/admin' }: AdminRolesViewProps) {
  const accessToken = useAuthStore((state) => state.accessToken);

  const rolesQuery = useQuery({
    queryKey: ['admin-roles-overview', accessToken],
    queryFn: () => getAdminRolesOverview(accessToken),
    enabled: Boolean(accessToken),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 15_000,
  });

  const data = rolesQuery.data?.data;
  const roles = data?.roles ?? [];
  const permissionMatrix = data?.permissionMatrix ?? [];
  const superAdmins = data?.superAdmins ?? [];
  const recentAuditLogs = data?.recentRoleAuditLogs ?? [];

  const activeSuperAdminCount = superAdmins.filter((a) => a.isActive).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="ACCESS CONTROL & GOVERNANCE"
        title="Roles & Permissions Matrix"
        description="Inspect the four institutional roles, read-only permission boundaries, active Super Admin roster, and recent role governance audit events."
        badge={
          <Badge variant="neutral">
            <Key size={11} className="mr-1" /> 4 Institutional Roles
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync Active
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => rolesQuery.refetch()}
              disabled={rolesQuery.isFetching}
            >
              <RefreshCw size={13} className={rolesQuery.isFetching ? 'animate-spin' : ''} /> Refresh
            </Button>
          </div>
        }
      />

      {rolesQuery.isError ? (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-rose-950 m-0">Unable to load roles & permissions</p>
              <p className="text-rose-700 m-0 mt-0.5">
                {rolesQuery.error instanceof Error
                  ? rolesQuery.error.message
                  : 'An error occurred while fetching RBAC governance metadata.'}
              </p>
            </div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => rolesQuery.refetch()}>
            <RefreshCw size={13} /> Retry
          </Button>
        </div>
      ) : rolesQuery.isLoading ? (
        <div className="space-y-6">
          <CardGridSkeleton count={4} />
          <TableSkeleton rows={6} cols={5} />
        </div>
      ) : (
        <>
          {/* Quorum Advisory Banner */}
          {activeSuperAdminCount < 2 ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
              <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950 m-0">
                  Single Super Admin Detected ({activeSuperAdminCount} active)
                </p>
                <p className="m-0 mt-0.5">
                  Institutional governance best practice recommends maintaining at least two active
                  Super Admin accounts for business continuity. The sole remaining Super Admin is
                  automatically protected from suspension.
                </p>
              </div>
            </div>
          ) : null}

          {/* 4 Role Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((role) => (
              <div
                key={role.name}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={role.name} />
                    <span className="text-[11px] font-semibold text-slate-400">
                      {role.permissionCount} permissions
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed m-0">{role.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users size={14} className="text-slate-400" />
                    <strong className="text-lg text-slate-900">
                      {role.userCount.toLocaleString()}
                    </strong>
                    <span>account{role.userCount === 1 ? '' : 's'}</span>
                  </div>
                  {role.name === 'STUDENT' ? (
                    <Link
                      href={`${basePath}/users/students`}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Roster →
                    </Link>
                  ) : role.name === 'ALUMNI' ? (
                    <Link
                      href={`${basePath}/users/alumni`}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Roster →
                    </Link>
                  ) : role.name === 'MODERATOR' ? (
                    <Link
                      href={`${basePath}/users/moderators`}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Staff →
                    </Link>
                  ) : (
                    <span className="text-[11px] font-semibold text-purple-700">Protected</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Read-Only Permission Matrix */}
          <section className="space-y-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 m-0">
                Institutional Permission Matrix (Read-Only)
              </h2>
              <p className="text-xs text-slate-500 m-0">
                Permissions are strictly enforced at the API middleware layer across isolated role
                dashboards.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="p-3.5 pl-5">Resource & Capability</th>
                      {ROLE_ORDER.map((r) => (
                        <th key={r} className="p-3.5 text-center">
                          {r.replace('_', ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {permissionMatrix.map((row) => (
                      <tr key={row.key} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 pl-5">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px] uppercase tracking-wider">
                              {row.resource}
                            </span>
                            <span className="font-bold text-slate-900">{row.action}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 m-0 mt-0.5">
                            {row.description}{' '}
                            <span className="font-mono text-slate-400">({row.key})</span>
                          </p>
                        </td>
                        {ROLE_ORDER.map((roleKey) => {
                          const allowed = row.roles[roleKey];
                          return (
                            <td key={roleKey} className="p-3.5 text-center">
                              {allowed ? (
                                <span
                                  aria-label={`${roleKey} granted`}
                                  className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
                                >
                                  <Check size={13} />
                                </span>
                              ) : (
                                <span
                                  aria-label={`${roleKey} not granted`}
                                  className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-50 text-slate-300"
                                >
                                  <Minus size={13} />
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Super Admin Roster & Recent Role Audit Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Super Admin Roster */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-purple-600" />
                  <h2 className="text-sm font-bold text-slate-900 m-0">Super Admin Roster</h2>
                </div>
                <Badge variant="neutral">{superAdmins.length} total</Badge>
              </div>
              <div className="divide-y divide-slate-100">
                {superAdmins.map((admin) => (
                  <div
                    key={admin.id}
                    className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={admin.name} src={admin.avatarUrl} />
                      <div className="min-w-0">
                        <Link
                          href={`${basePath}/users/${admin.id}`}
                          className="text-xs font-bold text-slate-900 hover:text-blue-600 block truncate"
                        >
                          {admin.name}
                        </Link>
                        <p className="text-[11px] text-slate-500 m-0 truncate">{admin.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {admin.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={11} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          Inactive
                        </span>
                      )}
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`${basePath}/users/${admin.id}`}>Inspect</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Role & Moderator Governance Audit Log */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900 m-0">
                    Recent Role & Staff Audit Events
                  </h2>
                </div>
                <Link
                  href={`${basePath}/activity-logs`}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Full Audit Log →
                </Link>
              </div>
              {recentAuditLogs.length === 0 ? (
                <p className="p-6 text-xs text-slate-500 italic text-center m-0">
                  No role transitions or moderator delegation events recorded yet.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  {recentAuditLogs.map((log) => (
                    <div key={log.id} className="p-3.5 text-xs hover:bg-slate-50/60">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-slate-800 text-[11px]">
                          {log.action}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 m-0 mt-0.5">
                        Actor:{' '}
                        <strong className="text-slate-800">{log.actor?.name || 'System'}</strong>
                        {log.targetId ? ` · Target: ${log.targetId.slice(-8)}` : ''}
                      </p>
                      {log.metadata && typeof log.metadata === 'object' && 'reason' in log.metadata ? (
                        <p className="text-[11px] text-slate-500 m-0 mt-1 italic">
                          &ldquo;{String(log.metadata.reason)}&rdquo;
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
