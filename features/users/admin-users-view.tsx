'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Ban,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  GraduationCap,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog';
import { EmptyState } from '@/components/dashboard/empty-state';
import { TableSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import {
  getAdminUsers,
  toggleUserSuspension,
  type AdminUserItem,
} from '@/lib/api/admin.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface AdminUsersViewProps {
  currentRole: UserRole;
  basePath: string;
  roleFilterPreset?: UserRole;
}

export function AdminUsersView({ currentRole, basePath, roleFilterPreset }: AdminUsersViewProps) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>(roleFilterPreset || 'ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [search, setSearch] = useState('');
  const [targetUser, setTargetUser] = useState<{ user: AdminUserItem; nextIsActive: boolean } | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const usersQuery = useQuery({
    queryKey: ['admin-users-list', accessToken, roleFilter, statusFilter, search],
    queryFn: () =>
      getAdminUsers(accessToken, {
        role: roleFilter === 'ALL' ? undefined : roleFilter,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: search.trim() || undefined,
        limit: 100,
      }),
    enabled: Boolean(accessToken),
  });

  const suspendMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      toggleUserSuspension(accessToken, userId, isActive),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      setTargetUser(null);
      setActionNotice(`User account ${vars.isActive ? 'restored to active' : 'suspended'}.`);
      setTimeout(() => setActionNotice(null), 4000);
    },
    onError: (err: unknown) => {
      setActionNotice(err instanceof Error ? err.message : 'Failed to update user status.');
    },
  });

  const users: AdminUserItem[] = usersQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CAMPUS IDENTITY GOVERNANCE"
        title="User Accounts Directory"
        description="Master roster of all enrolled students, accredited alumni, and appointed staff across your university campus."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => usersQuery.refetch()}
              disabled={usersQuery.isFetching}
            >
              <RefreshCw size={13} className={usersQuery.isFetching ? 'animate-spin' : ''} /> Refresh Roster
            </Button>
            <Button asChild size="sm">
              <Link href={`${basePath}/verification/pending`}>
                <ShieldCheck size={14} /> Verification Queue
              </Link>
            </Button>
          </div>
        }
      />

      {actionNotice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      ) : null}

      {/* Filter Chips & Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, institutional email, student ID, or department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'ALL', label: 'All Roles' },
            { id: 'STUDENT', label: 'Students' },
            { id: 'ALUMNI', label: 'Alumni' },
            { id: 'MODERATOR', label: 'Moderators' },
            { id: 'SUPER_ADMIN', label: 'Admins' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setRoleFilter(item.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                roleFilter === item.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs border-l pl-3 border-slate-200">
          {[
            { id: 'ALL', label: 'All Status' },
            { id: 'ACTIVE', label: 'Active' },
            { id: 'SUSPENDED', label: 'Suspended' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStatusFilter(item.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === item.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {usersQuery.isLoading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users match query"
          description="Try broadening your search term or selecting 'All Roles'."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="p-3.5 pl-5">Member</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Department & Batch</th>
                  <th className="p-3.5">Institutional ID</th>
                  <th className="p-3.5">Account Status</th>
                  <th className="p-3.5">Verification</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <Avatar name={usr.name} src={usr.avatarUrl} />
                        <div>
                          <p className="font-bold text-slate-900 m-0">{usr.name}</p>
                          <p className="text-[11px] text-slate-400 m-0">{usr.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <StatusBadge status={usr.role.name} />
                    </td>

                    <td className="p-3.5">
                      <p className="font-semibold text-slate-800 m-0">{usr.department || 'Enrolled'}</p>
                      <p className="text-[11px] text-slate-400 m-0">Batch {usr.batch || 'Class'}</p>
                    </td>

                    <td className="p-3.5 font-mono text-slate-700">
                      {usr.studentId || usr.academicId || '—'}
                    </td>

                    <td className="p-3.5">
                      {usr.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <Ban size={12} /> Suspended
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <StatusBadge status={usr.verificationStatus} />
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`${basePath}/users/${usr.id}`}>
                            Details
                          </Link>
                        </Button>
                        {usr.isActive ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setTargetUser({ user: usr, nextIsActive: false })}
                            className="text-rose-600 hover:bg-rose-50"
                          >
                            <Ban size={13} /> Suspend
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setTargetUser({ user: usr, nextIsActive: true })}
                            className="text-emerald-600 hover:bg-emerald-50"
                          >
                            <UserCheck size={13} /> Restore
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Suspend / Restore Confirmation Dialog */}
      {targetUser ? (
        <ConfirmDialog
          isOpen={Boolean(targetUser)}
          onClose={() => setTargetUser(null)}
          onConfirm={() =>
            suspendMutation.mutate({
              userId: targetUser.user.id,
              isActive: targetUser.nextIsActive,
            })
          }
          title={`${targetUser.nextIsActive ? 'Restore' : 'Suspend'} Account: ${targetUser.user.name}`}
          description={
            targetUser.nextIsActive
              ? `Restoring this account will allow ${targetUser.user.email} to sign in and interact on the platform.`
              : `Suspending will invalidate all active sessions for ${targetUser.user.email}. They will be unable to log in until reinstated.`
          }
          confirmLabel={targetUser.nextIsActive ? 'Restore User' : 'Suspend User'}
          variant={targetUser.nextIsActive ? 'primary' : 'destructive'}
          isLoading={suspendMutation.isPending}
        />
      ) : null}
    </div>
  );
}
