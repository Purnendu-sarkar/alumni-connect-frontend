'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Ban,
  Check,
  CheckCircle2,
  GraduationCap,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog';
import { EmptyState } from '@/components/dashboard/empty-state';
import { TableSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import {
  changeAdminUserRole,
  getAdminUsers,
  reviewVerification,
  toggleUserSuspension,
  type AdminUserItem,
} from '@/lib/api/admin.api';
import { useDepartments } from '@/hooks/use-departments';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole, VerificationStatus } from '@/types/domain';

interface AdminUsersViewProps {
  currentRole: UserRole;
  basePath: string;
  roleFilterPreset?: UserRole;
}

export function AdminUsersView({ basePath, roleFilterPreset }: AdminUsersViewProps) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentUser = useAuthStore((state) => state.user);

  const isStudentRoster = roleFilterPreset === 'STUDENT';
  const isAlumniRoster = roleFilterPreset === 'ALUMNI';
  const isRoleLocked = Boolean(roleFilterPreset);

  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>(roleFilterPreset || 'ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<VerificationStatus | 'ALL'>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  const [targetUser, setTargetUser] = useState<{
    user: AdminUserItem;
    nextIsActive: boolean;
  } | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  const [graduateTarget, setGraduateTarget] = useState<AdminUserItem | null>(null);
  const [graduateYear, setGraduateYear] = useState(String(new Date().getFullYear()));
  const [graduateReason, setGraduateReason] = useState('');

  const [revokeTarget, setRevokeTarget] = useState<AdminUserItem | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  const { departments: activeDepts } = useDepartments();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  const effectiveRole = roleFilterPreset ?? (roleFilter === 'ALL' ? undefined : roleFilter);

  const usersQuery = useQuery({
    queryKey: [
      'admin-users-list',
      accessToken,
      effectiveRole ?? 'ALL',
      statusFilter,
      verificationFilter,
      departmentFilter,
      debouncedSearch,
      page,
    ],
    queryFn: () =>
      getAdminUsers(accessToken, {
        role: effectiveRole,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        verificationStatus: verificationFilter === 'ALL' ? undefined : verificationFilter,
        department: departmentFilter === 'ALL' ? undefined : departmentFilter,
        search: debouncedSearch || undefined,
        page,
        limit: 25,
      }),
    enabled: Boolean(accessToken),
  });

  const suspendMutation = useMutation({
    mutationFn: ({
      userId,
      isActive,
      reason,
    }: {
      userId: string;
      isActive: boolean;
      reason?: string;
    }) => toggleUserSuspension(accessToken, userId, isActive, reason),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setTargetUser(null);
      setSuspendReason('');
      showFeedback(
        'success',
        `User account ${vars.isActive ? 'restored to active standing' : 'suspended and sessions terminated'}.`,
      );
    },
    onError: (err: unknown) => {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to update user status.');
    },
  });

  const graduateMutation = useMutation({
    mutationFn: ({
      userId,
      graduationYear,
      reason,
    }: {
      userId: string;
      graduationYear: string;
      reason: string;
    }) =>
      changeAdminUserRole(accessToken, userId, {
        role: 'ALUMNI',
        graduationYear: graduationYear.trim() || null,
        reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setGraduateTarget(null);
      setGraduateReason('');
      showFeedback(
        'success',
        'Student graduated to Alumni successfully. Active sessions revoked so role updates on next login.',
      );
    },
    onError: (err: unknown) => {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to graduate student.');
    },
  });

  const verificationMutation = useMutation({
    mutationFn: ({
      userId,
      status,
      reason,
    }: {
      userId: string;
      status: 'APPROVED' | 'REVOKED';
      reason?: string;
    }) => reviewVerification(accessToken, userId, { status, reason }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setRevokeTarget(null);
      setRevokeReason('');
      showFeedback(
        'success',
        vars.status === 'APPROVED'
          ? 'Alumni accreditation approved.'
          : 'Alumni accreditation revoked and sessions terminated.',
      );
    },
    onError: (err: unknown) => {
      showFeedback(
        'error',
        err instanceof Error ? err.message : 'Failed to update verification standing.',
      );
    },
  });

  const users: AdminUserItem[] = usersQuery.data?.data ?? [];
  const meta = usersQuery.data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const totalCount = meta?.total ?? users.length;

  const isSuspendReasonValid = targetUser?.nextIsActive ? true : suspendReason.trim().length >= 10;
  const isGraduateReasonValid = graduateReason.trim().length >= 10;
  const isRevokeReasonValid = revokeReason.trim().length >= 10;

  const pageTitle = isStudentRoster
    ? 'Student Directory Roster'
    : isAlumniRoster
      ? 'Alumni Directory Roster'
      : 'User Accounts Directory';

  const pageEyebrow = isStudentRoster
    ? 'ENROLLED STUDENT GOVERNANCE'
    : isAlumniRoster
      ? 'ALUMNI ACCREDITATION ROSTER'
      : 'CAMPUS IDENTITY GOVERNANCE';

  const pageDescription = isStudentRoster
    ? 'Manage currently enrolled university students, review academic standing, and graduate eligible cohorts to Alumni.'
    : isAlumniRoster
      ? 'Oversee registered university alumni, monitor accreditation standing, and manage verification approvals.'
      : 'Master roster of all enrolled students, accredited alumni, moderators, and administrators across your campus.';

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={pageEyebrow}
        title={pageTitle}
        description={pageDescription}
        badge={
          <Badge variant="neutral">
            {totalCount.toLocaleString()} member{totalCount === 1 ? '' : 's'}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => usersQuery.refetch()}
              disabled={usersQuery.isFetching}
            >
              <RefreshCw size={13} className={usersQuery.isFetching ? 'animate-spin' : ''} /> Refresh
              Roster
            </Button>
            <Button asChild size="sm">
              <Link href={`${basePath}/verification/pending`}>
                <ShieldCheck size={14} /> Verification Queue
              </Link>
            </Button>
          </div>
        }
      />

      {feedback ? (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            feedback.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          {feedback.type === 'error' ? (
            <ShieldAlert size={16} className="text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      ) : null}

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder={
                isStudentRoster
                  ? 'Search students by name, email, student ID, or department…'
                  : isAlumniRoster
                    ? 'Search alumni by name, email, academic ID, batch, or department…'
                    : 'Search by name, institutional email, student ID, or department…'
              }
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {!isRoleLocked ? (
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {(
                [
                  { id: 'ALL', label: 'All Roles' },
                  { id: 'STUDENT', label: 'Students' },
                  { id: 'ALUMNI', label: 'Alumni' },
                  { id: 'MODERATOR', label: 'Moderators' },
                  { id: 'SUPER_ADMIN', label: 'Admins' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setRoleFilter(item.id);
                    setPage(1);
                  }}
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
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs">
            {(
              [
                { id: 'ALL', label: 'All Status' },
                { id: 'ACTIVE', label: 'Active' },
                { id: 'SUSPENDED', label: 'Suspended' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setStatusFilter(item.id);
                  setPage(1);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === item.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <select
            aria-label="Filter by verification standing"
            value={verificationFilter}
            onChange={(e) => {
              setVerificationFilter(e.target.value as VerificationStatus | 'ALL');
              setPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">All Verification States</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending Review</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {activeDepts && activeDepts.length > 0 ? (
            <select
              aria-label="Filter by academic department"
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {activeDepts.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.code} — {d.name}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </div>

      {/* Error State with Retry */}
      {usersQuery.isError ? (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-rose-950 m-0">Unable to load user directory</p>
              <p className="text-rose-700 m-0 mt-0.5">
                {usersQuery.error instanceof Error
                  ? usersQuery.error.message
                  : 'An error occurred while fetching user accounts from the server.'}
              </p>
            </div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => usersQuery.refetch()}>
            <RefreshCw size={13} /> Retry
          </Button>
        </div>
      ) : usersQuery.isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users match current filters"
          description="Try broadening your search query or resetting status and department filters."
          action={
            searchInput ||
            statusFilter !== 'ALL' ||
            verificationFilter !== 'ALL' ||
            departmentFilter !== 'ALL' ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setSearchInput('');
                  setStatusFilter('ALL');
                  setVerificationFilter('ALL');
                  setDepartmentFilter('ALL');
                  setPage(1);
                }}
              >
                Reset Filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="p-3.5 pl-5">Member</th>
                    {!isRoleLocked ? <th className="p-3.5">Role</th> : null}
                    {isStudentRoster ? (
                      <>
                        <th className="p-3.5">Student ID</th>
                        <th className="p-3.5">Department & Batch</th>
                        <th className="p-3.5">Semester / Expected Grad</th>
                      </>
                    ) : isAlumniRoster ? (
                      <>
                        <th className="p-3.5">Graduation Year</th>
                        <th className="p-3.5">Academic ID</th>
                        <th className="p-3.5">Position & Company</th>
                      </>
                    ) : (
                      <>
                        <th className="p-3.5">Department & Batch</th>
                        <th className="p-3.5">Institutional ID</th>
                      </>
                    )}
                    <th className="p-3.5">Account Status</th>
                    <th className="p-3.5">Verification</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((usr) => {
                    const isSelf = currentUser?.id === usr.id;

                    return (
                      <tr key={usr.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 pl-5">
                          <div className="flex items-center gap-3">
                            <Avatar name={usr.name} src={usr.avatarUrl} />
                            <div>
                              <Link
                                href={`${basePath}/users/${usr.id}`}
                                className="font-bold text-slate-900 hover:text-blue-600 transition-colors"
                              >
                                {usr.name}
                              </Link>
                              <p className="text-[11px] text-slate-400 m-0">{usr.email}</p>
                            </div>
                          </div>
                        </td>

                        {!isRoleLocked ? (
                          <td className="p-3.5">
                            <StatusBadge status={usr.role.name} />
                          </td>
                        ) : null}

                        {isStudentRoster ? (
                          <>
                            <td className="p-3.5 font-mono text-slate-700">
                              {usr.studentId || '—'}
                            </td>
                            <td className="p-3.5">
                              <p className="font-semibold text-slate-800 m-0">
                                {usr.department || 'Unassigned'}
                              </p>
                              <p className="text-[11px] text-slate-400 m-0">
                                Batch {usr.batch || '—'}
                              </p>
                            </td>
                            <td className="p-3.5">
                              <p className="font-medium text-slate-800 m-0">
                                {usr.currentSemester || 'Active Term'}
                              </p>
                              <p className="text-[11px] text-slate-400 m-0">
                                {usr.expectedGraduationYear
                                  ? `Expected ${usr.expectedGraduationYear}`
                                  : 'Expected grad N/A'}
                              </p>
                            </td>
                          </>
                        ) : isAlumniRoster ? (
                          <>
                            <td className="p-3.5">
                              <p className="font-semibold text-slate-800 m-0">
                                {usr.graduationYear || '—'}
                              </p>
                              <p className="text-[11px] text-slate-400 m-0">
                                {usr.department || 'Unassigned'}
                              </p>
                            </td>
                            <td className="p-3.5 font-mono text-slate-700">
                              {usr.academicId || usr.studentId || '—'}
                            </td>
                            <td className="p-3.5">
                              <p className="font-semibold text-slate-800 m-0">
                                {usr.position || '—'}
                              </p>
                              <p className="text-[11px] text-slate-400 m-0">
                                {usr.currentCompany || usr.employmentStatus || 'Not listed'}
                              </p>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3.5">
                              <p className="font-semibold text-slate-800 m-0">
                                {usr.department || 'Unassigned'}
                              </p>
                              <p className="text-[11px] text-slate-400 m-0">
                                Batch {usr.batch || '—'}
                              </p>
                            </td>
                            <td className="p-3.5 font-mono text-slate-700">
                              {usr.studentId || usr.academicId || '—'}
                            </td>
                          </>
                        )}

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
                          <div className="flex flex-col gap-0.5 items-start">
                            <StatusBadge status={usr.verificationStatus} />
                            {!usr.verified ? (
                              <span className="text-[10px] text-amber-700 font-medium">
                                Email unconfirmed
                              </span>
                            ) : null}
                          </div>
                        </td>

                        <td className="p-3.5 pr-5 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <Button size="sm" variant="ghost" asChild>
                              <Link href={`${basePath}/users/${usr.id}`}>Details</Link>
                            </Button>

                            {isStudentRoster && usr.isActive ? (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  setGraduateTarget(usr);
                                  setGraduateYear(
                                    usr.expectedGraduationYear || String(new Date().getFullYear()),
                                  );
                                  setGraduateReason('');
                                }}
                              >
                                <GraduationCap size={13} /> Graduate
                              </Button>
                            ) : null}

                            {isAlumniRoster &&
                            usr.verificationStatus !== 'APPROVED' &&
                            usr.verified ? (
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={verificationMutation.isPending}
                                onClick={() =>
                                  verificationMutation.mutate({
                                    userId: usr.id,
                                    status: 'APPROVED',
                                  })
                                }
                                className="text-emerald-700 hover:bg-emerald-50"
                              >
                                <Check size={13} /> Approve
                              </Button>
                            ) : null}

                            {isAlumniRoster && usr.verificationStatus === 'APPROVED' ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setRevokeTarget(usr);
                                  setRevokeReason('');
                                }}
                                className="text-amber-700 hover:bg-amber-50"
                              >
                                Revoke
                              </Button>
                            ) : null}

                            {!isSelf ? (
                              usr.isActive ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setTargetUser({ user: usr, nextIsActive: false });
                                    setSuspendReason('');
                                  }}
                                  className="text-rose-600 hover:bg-rose-50"
                                >
                                  <Ban size={13} /> Suspend
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setTargetUser({ user: usr, nextIsActive: true });
                                    setSuspendReason('');
                                  }}
                                  className="text-emerald-600 hover:bg-emerald-50"
                                >
                                  <UserCheck size={13} /> Restore
                                </Button>
                              )
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 ? (
            <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500">
                Page <strong className="text-slate-800">{page}</strong> of{' '}
                <strong className="text-slate-800">{totalPages}</strong> ({totalCount} total)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page <= 1 || usersQuery.isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page >= totalPages || usersQuery.isFetching}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Suspend / Restore Confirmation Dialog */}
      {targetUser ? (
        <ConfirmDialog
          isOpen={Boolean(targetUser)}
          onClose={() => {
            setTargetUser(null);
            setSuspendReason('');
          }}
          onConfirm={() => {
            if (!isSuspendReasonValid) return;
            suspendMutation.mutate({
              userId: targetUser.user.id,
              isActive: targetUser.nextIsActive,
              reason: targetUser.nextIsActive ? undefined : suspendReason.trim(),
            });
          }}
          title={`${targetUser.nextIsActive ? 'Restore' : 'Suspend'} Account: ${targetUser.user.name}`}
          description={
            targetUser.nextIsActive
              ? `Restoring this account will allow ${targetUser.user.email} to sign in and participate on the platform.`
              : `Suspending will immediately revoke all active sessions for ${targetUser.user.email}. Provide a mandatory audit reason.`
          }
          confirmLabel={targetUser.nextIsActive ? 'Restore User' : 'Suspend User'}
          variant={targetUser.nextIsActive ? 'primary' : 'destructive'}
          isLoading={suspendMutation.isPending}
          confirmDisabled={!isSuspendReasonValid}
        >
          {!targetUser.nextIsActive ? (
            <div className="mt-3 space-y-1.5 text-left">
              <label
                htmlFor="roster-suspend-reason"
                className="block text-xs font-bold text-slate-700"
              >
                Mandatory Reason for Suspension (minimum 10 characters) *
              </label>
              <textarea
                id="roster-suspend-reason"
                rows={3}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Repeated community guideline violation verified by moderation team."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:bg-white"
              />
              <p
                className={`text-[11px] m-0 ${
                  isSuspendReasonValid ? 'text-emerald-600' : 'text-slate-500'
                }`}
              >
                {suspendReason.trim().length}/10 minimum characters
              </p>
            </div>
          ) : null}
        </ConfirmDialog>
      ) : null}

      {/* Graduate Student to Alumni Dialog */}
      {graduateTarget ? (
        <ConfirmDialog
          isOpen={Boolean(graduateTarget)}
          onClose={() => {
            setGraduateTarget(null);
            setGraduateReason('');
          }}
          onConfirm={() => {
            if (!isGraduateReasonValid) return;
            graduateMutation.mutate({
              userId: graduateTarget.id,
              graduationYear: graduateYear,
              reason: graduateReason.trim(),
            });
          }}
          title={`Graduate to Alumni: ${graduateTarget.name}`}
          description={`Transition ${graduateTarget.email} from STUDENT to ALUMNI. Their accreditation will be marked APPROVED and active sessions will be refreshed on next sign-in.`}
          confirmLabel="Confirm Graduation"
          variant="primary"
          isLoading={graduateMutation.isPending}
          confirmDisabled={!isGraduateReasonValid}
        >
          <div className="mt-3 space-y-3 text-left">
            <div>
              <label
                htmlFor="graduate-year-input"
                className="block text-xs font-bold text-slate-700 mb-1"
              >
                Graduation Year
              </label>
              <Input
                id="graduate-year-input"
                value={graduateYear}
                onChange={(e) => setGraduateYear(e.target.value)}
                placeholder="e.g. 2026"
              />
            </div>
            <div>
              <label
                htmlFor="graduate-reason-input"
                className="block text-xs font-bold text-slate-700 mb-1"
              >
                Mandatory Audit Reason (minimum 10 characters) *
              </label>
              <textarea
                id="graduate-reason-input"
                rows={3}
                value={graduateReason}
                onChange={(e) => setGraduateReason(e.target.value)}
                placeholder="e.g. Confirmed degree conferral on official Spring 2026 convocation roster."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              <p
                className={`text-[11px] m-0 mt-1 ${
                  isGraduateReasonValid ? 'text-emerald-600' : 'text-slate-500'
                }`}
              >
                {graduateReason.trim().length}/10 minimum characters
              </p>
            </div>
          </div>
        </ConfirmDialog>
      ) : null}

      {/* Revoke Alumni Accreditation Dialog */}
      {revokeTarget ? (
        <ConfirmDialog
          isOpen={Boolean(revokeTarget)}
          onClose={() => {
            setRevokeTarget(null);
            setRevokeReason('');
          }}
          onConfirm={() => {
            if (!isRevokeReasonValid) return;
            verificationMutation.mutate({
              userId: revokeTarget.id,
              status: 'REVOKED',
              reason: revokeReason.trim(),
            });
          }}
          title={`Revoke Accreditation: ${revokeTarget.name}`}
          description={`Revoking accreditation resets ${revokeTarget.name} to pending review and terminates their active sessions.`}
          confirmLabel="Revoke Accreditation"
          variant="destructive"
          isLoading={verificationMutation.isPending}
          confirmDisabled={!isRevokeReasonValid}
        >
          <div className="mt-3 space-y-1.5 text-left">
            <label
              htmlFor="alumni-revoke-reason"
              className="block text-xs font-bold text-slate-700"
            >
              Mandatory Reason for Revocation (minimum 10 characters) *
            </label>
            <textarea
              id="alumni-revoke-reason"
              rows={3}
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="e.g. Registrar audit flagged mismatch in academic registration credentials."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:bg-white"
            />
            <p
              className={`text-[11px] m-0 ${
                isRevokeReasonValid ? 'text-emerald-600' : 'text-slate-500'
              }`}
            >
              {revokeReason.trim().length}/10 minimum characters
            </p>
          </div>
        </ConfirmDialog>
      ) : null}
    </div>
  );
}
