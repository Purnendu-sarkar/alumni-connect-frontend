'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Ban,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  KeyRound,
  LogOut,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  UserCheck,
  XCircle,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getAdminUserDetail,
  reviewVerification,
  terminateUserSessions,
  toggleUserSuspension,
  type AdminUserDetail,
} from '@/lib/api/admin.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole, VerificationStatus } from '@/types/domain';

interface AdminUserDetailViewProps {
  id: string;
  currentRole: UserRole;
  basePath: string;
}

export function AdminUserDetailView({ id, currentRole, basePath }: AdminUserDetailViewProps) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [actionNotice, setActionNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal Dialog States
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  const [verifyModal, setVerifyModal] = useState<{
    open: boolean;
    status: 'APPROVED' | 'REJECTED' | 'REVOKED';
  }>({ open: false, status: 'APPROVED' });
  const [verifyReason, setVerifyReason] = useState('');

  const [terminateSessionsModalOpen, setTerminateSessionsModalOpen] = useState(false);

  const userQuery = useQuery({
    queryKey: ['admin-user-detail', id, accessToken],
    queryFn: () => getAdminUserDetail(accessToken, id),
    enabled: Boolean(accessToken && id),
  });

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setActionNotice({ message, type });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const suspendMutation = useMutation({
    mutationFn: ({ isActive, reason }: { isActive: boolean; reason?: string }) =>
      toggleUserSuspension(accessToken, id, isActive, reason),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      setSuspendModalOpen(false);
      setSuspendReason('');
      notify(`User account successfully ${vars.isActive ? 'restored to active' : 'suspended'}.`);
    },
    onError: (err: unknown) => {
      notify(err instanceof Error ? err.message : 'Failed to update user status.', 'error');
    },
  });

  const verifyMutation = useMutation({
    mutationFn: ({ status, reason }: { status: 'APPROVED' | 'REJECTED' | 'REVOKED'; reason?: string }) =>
      reviewVerification(accessToken, id, { status, reason }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      setVerifyModal({ open: false, status: 'APPROVED' });
      setVerifyReason('');
      const statusLabel =
        vars.status === 'APPROVED' ? 'accreditation approved' : vars.status === 'REVOKED' ? 'accreditation revoked' : 'accreditation rejected';
      notify(`User ${statusLabel} successfully.`);
    },
    onError: (err: unknown) => {
      notify(err instanceof Error ? err.message : 'Failed to update verification status.', 'error');
    },
  });

  const terminateSessionsMutation = useMutation({
    mutationFn: () => terminateUserSessions(accessToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail', id] });
      setTerminateSessionsModalOpen(false);
      notify('All active sessions for this user have been terminated.');
    },
    onError: (err: unknown) => {
      notify(err instanceof Error ? err.message : 'Failed to terminate sessions.', 'error');
    },
  });

  if (userQuery.isLoading) {
    return (
      <div className="space-y-6 max-w-5xl py-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded-md mb-4" />
        <div className="h-14 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-96 bg-slate-200 rounded-xl" />
          <div className="h-96 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (userQuery.isError || !userQuery.data?.data) {
    return (
      <div className="space-y-6 max-w-5xl py-6">
        <Link
          href={`${basePath}/users`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={14} /> Back to User Directory
        </Link>
        <EmptyState
          icon={XCircle}
          title="User record not found"
          description="The requested user account does not exist or has been removed from this institution."
          action={
            <Button asChild size="sm">
              <Link href={`${basePath}/users`}>Return to Directory</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const user: AdminUserDetail = userQuery.data.data;
  const isSuperAdminViewer = currentRole === 'SUPER_ADMIN';

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Link
          href={`${basePath}/users`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
        >
          <ArrowLeft size={14} /> Back to User Directory
        </Link>
        <PageHeader
          eyebrow={`CAMPUS RECORD #${user.id.slice(-8).toUpperCase()}`}
          title={user.name}
          badge={
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={user.role.name} />
              <StatusBadge status={user.verificationStatus} />
              {!user.isActive ? (
                <Badge variant="error" className="flex items-center gap-1">
                  <Ban size={11} /> Suspended
                </Badge>
              ) : (
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle2 size={11} /> Active
                </Badge>
              )}
              {user.isDemo && <Badge variant="secondary">Demo Account</Badge>}
            </div>
          }
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => userQuery.refetch()}
                disabled={userQuery.isFetching}
              >
                <RefreshCw size={13} className={userQuery.isFetching ? 'animate-spin' : ''} /> Refresh
              </Button>

              {isSuperAdminViewer && (
                <>
                  <Button
                    size="sm"
                    variant={user.isActive ? 'destructive' : 'primary'}
                    onClick={() => {
                      setSuspendReason('');
                      setSuspendModalOpen(true);
                    }}
                  >
                    {user.isActive ? (
                      <>
                        <Ban size={14} /> Suspend User
                      </>
                    ) : (
                      <>
                        <UserCheck size={14} /> Reactivate User
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          }
        />
      </div>

      {actionNotice ? (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            actionNotice.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          {actionNotice.type === 'error' ? (
            <ShieldAlert size={16} className="text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          )}
          <span>{actionNotice.message}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content Pane with Tabs */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-slate-100 p-1 rounded-xl">
              <TabsTrigger value="overview" className="text-xs font-semibold">Overview & Identity</TabsTrigger>
              <TabsTrigger value="verification" className="text-xs font-semibold">Verification Controls</TabsTrigger>
              <TabsTrigger value="security" className="text-xs font-semibold">
                Sessions ({user.refreshTokens?.length ?? 0})
              </TabsTrigger>
              <TabsTrigger value="audit" className="text-xs font-semibold">
                Audit History ({user.auditLogs?.length ?? 0})
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: OVERVIEW & ACADEMIC IDENTITY */}
            <TabsContent value="overview" className="space-y-6 mt-4">
              <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Academic & Campus Record
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[11px]">Primary Email</span>
                    <span className="font-semibold text-slate-800 font-mono mt-0.5 block">{user.email}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[11px]">
                      {user.role.name === 'STUDENT' ? 'Student ID' : 'Academic / Registration ID'}
                    </span>
                    <span className="font-semibold text-slate-800 font-mono mt-0.5 block">
                      {user.studentId || user.academicId || '—'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[11px]">Department / Faculty</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{user.department || 'Enrolled'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[11px]">Batch / Cohort</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{user.batch || '—'}</span>
                  </div>
                  {user.graduationYear ? (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 block text-[11px]">Graduation Year</span>
                      <span className="font-semibold text-slate-800 mt-0.5 block">{user.graduationYear}</span>
                    </div>
                  ) : null}
                  {user.currentSemester ? (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 block text-[11px]">Current Semester</span>
                      <span className="font-semibold text-slate-800 mt-0.5 block">{user.currentSemester}</span>
                    </div>
                  ) : null}
                </div>

                {/* Professional Profile for Alumni */}
                {user.role.name === 'ALUMNI' ? (
                  <div className="pt-3 border-t border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-700 mb-2">Current Career & Organization</h4>
                    <div className="p-3.5 bg-slate-50 rounded-lg flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <strong className="text-slate-900 text-xs block">
                          {user.position || 'Professional Member'}
                        </strong>
                        <span className="text-[11px] text-slate-500">
                          {user.currentCompany || 'Independent'} · {user.employmentStatus || 'Employed'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Bio & Headline */}
                {user.bio || user.headline ? (
                  <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                    <h4 className="font-semibold text-slate-700 m-0">About / Headline</h4>
                    {user.headline && <p className="font-medium text-slate-800 m-0">{user.headline}</p>}
                    {user.bio && <p className="text-slate-600 m-0 leading-relaxed">{user.bio}</p>}
                  </div>
                ) : null}

                {/* Skills & Interests */}
                {user.skills?.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-700 mb-1.5">Endorsed Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {user.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 2: VERIFICATION & ACCREDITATION CONTROLS */}
            <TabsContent value="verification" className="space-y-6 mt-4">
              <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Accreditation & Trust Governance
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[11px]">Email Verification Status</span>
                    <span className={`font-semibold mt-0.5 flex items-center gap-1.5 ${user.verified ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {user.verified ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                      {user.verified ? 'Verified Email Address' : 'Pending Email Ownership Confirmation'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[11px]">Accreditation Standing</span>
                    <div className="mt-0.5">
                      <StatusBadge status={user.verificationStatus} />
                    </div>
                  </div>

                  {user.verifiedAt && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 block text-[11px]">Accredited At</span>
                      <span className="font-semibold text-slate-800 mt-0.5 block">
                        {new Date(user.verifiedAt).toLocaleDateString()} at{' '}
                        {new Date(user.verifiedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  )}

                  {user.rejectionReason && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg sm:col-span-2">
                      <span className="text-rose-700 font-semibold block text-[11px]">
                        Rejection / Revocation Reason Recorded:
                      </span>
                      <p className="text-xs text-rose-800 mt-0.5 m-0 font-mono">{user.rejectionReason}</p>
                    </div>
                  )}
                </div>

                {isSuperAdminViewer && (
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider m-0">
                      Administrative Actions
                    </h4>
                    <p className="text-xs text-slate-600 m-0">
                      Modifying accreditation status updates platform directory presence, mentor matching privileges, and job posting rights.
                    </p>

                    <div className="flex items-center gap-2 pt-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setVerifyReason('');
                          setVerifyModal({ open: true, status: 'APPROVED' });
                        }}
                        disabled={user.verificationStatus === 'APPROVED' || !user.verified}
                      >
                        <CheckCircle2 size={14} /> Approve Accreditation
                      </Button>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setVerifyReason('');
                          setVerifyModal({ open: true, status: 'REJECTED' });
                        }}
                        disabled={user.verificationStatus === 'REJECTED'}
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      >
                        <XCircle size={14} /> Reject Accreditation
                      </Button>

                      {user.verificationStatus === 'APPROVED' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setVerifyReason('');
                            setVerifyModal({ open: true, status: 'REVOKED' });
                          }}
                          className="text-amber-700 hover:bg-amber-50"
                        >
                          <ShieldAlert size={14} /> Revoke Accreditation
                        </Button>
                      )}
                    </div>

                    {!user.verified && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mt-2">
                        <strong>Notice:</strong> This user has not yet verified their email ownership. Administrative accreditation approval is gated until email verification is confirmed.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 3: SECURITY & ACTIVE SESSIONS */}
            <TabsContent value="security" className="space-y-6 mt-4">
              <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
                      Active User Sessions & Tokens
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 m-0">
                      HTTP-only rotating session tokens issued to this member.
                    </p>
                  </div>
                  {isSuperAdminViewer && (user.refreshTokens?.length ?? 0) > 0 && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setTerminateSessionsModalOpen(true)}
                    >
                      <LogOut size={13} /> Terminate All Sessions
                    </Button>
                  )}
                </div>

                {(!user.refreshTokens || user.refreshTokens.length === 0) ? (
                  <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-lg text-center">
                    No active sessions found. User is currently signed out.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500">
                        <tr>
                          <th className="p-3">Session Token</th>
                          <th className="p-3">Created</th>
                          <th className="p-3">Expires</th>
                          <th className="p-3">State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        {user.refreshTokens.map((token) => (
                          <tr key={token.id} className="hover:bg-slate-50">
                            <td className="p-3 text-slate-700">#{token.id.slice(-8)}</td>
                            <td className="p-3 text-slate-600 font-sans">
                              {new Date(token.createdAt).toLocaleString()}
                            </td>
                            <td className="p-3 text-slate-600 font-sans">
                              {new Date(token.expiresAt).toLocaleString()}
                            </td>
                            <td className="p-3 font-sans">
                              {token.revokedAt ? (
                                <span className="text-rose-600 font-semibold">Revoked</span>
                              ) : new Date(token.expiresAt) < new Date() ? (
                                <span className="text-slate-400">Expired</span>
                              ) : (
                                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                  <CheckCircle2 size={12} /> Active
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 4: MODERATION & AUDIT HISTORY */}
            <TabsContent value="audit" className="space-y-6 mt-4">
              <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
                    Administrative Audit Trail
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 m-0">
                    Security events and governance decisions recorded for this member.
                  </p>
                </div>

                {(!user.auditLogs || user.auditLogs.length === 0) ? (
                  <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-lg text-center">
                    No audit records logged for this account yet.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500">
                        <tr>
                          <th className="p-3">Action</th>
                          <th className="p-3">Initiated By</th>
                          <th className="p-3">Timestamp</th>
                          <th className="p-3">Reason / Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {user.auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="p-3">
                              <span className="font-mono font-semibold text-slate-800 text-[11px]">
                                {log.action}
                              </span>
                            </td>
                            <td className="p-3 text-slate-700">
                              {log.actor?.name || 'System / Platform'}
                              {log.actor?.email && (
                                <span className="block text-[10px] text-slate-400 font-mono">
                                  {log.actor.email}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-slate-500">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="p-3 text-slate-600 font-mono text-[11px]">
                              {log.metadata?.reason ? String(log.metadata.reason) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Side Panel: Profile Summary Card */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4 text-center">
            <Avatar name={user.name} src={user.avatarUrl} className="w-20 h-20 text-2xl mx-auto shadow-sm" />
            <div>
              <h4 className="text-base font-bold text-slate-900 m-0">{user.name}</h4>
              <p className="text-xs text-slate-500 m-0 mt-0.5">{user.role.name}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-left space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Account Status</span>
                <span className={user.isActive ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                  {user.isActive ? 'Active · In Good Standing' : 'Suspended'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Member Since</span>
                <span className="text-slate-700 font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">University Institution</span>
                <span className="text-slate-700 font-medium">{user.university.name}</span>
              </div>
              {user.phone && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Phone Contact</span>
                  <span className="text-slate-700 font-mono">
                    {user.phone} {user.phonePublic ? '(Public)' : '(Private)'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Suspend / Restore Confirmation Dialog */}
      <ConfirmDialog
        isOpen={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        title={user.isActive ? 'Suspend User Account' : 'Reactivate User Account'}
        description={
          user.isActive
            ? `Suspending ${user.name} (${user.email}) will immediately revoke all active sessions. The user will be barred from login until an administrator restores their standing.`
            : `Restoring ${user.name} will unblock their login and allow full access to platform resources.`
        }
        confirmLabel={user.isActive ? 'Suspend Account' : 'Reactivate Account'}
        variant={user.isActive ? 'destructive' : 'primary'}
        isLoading={suspendMutation.isPending}
        onConfirm={() =>
          suspendMutation.mutate({
            isActive: !user.isActive,
            reason: suspendReason.trim() || undefined,
          })
        }
      >
        {user.isActive ? (
          <div className="mt-3 text-left">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reason for Suspension (Optional):
            </label>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="e.g. Inappropriate community conduct, identity mismatch..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:bg-white"
              rows={3}
            />
          </div>
        ) : null}
      </ConfirmDialog>

      {/* Accreditation Review Dialog (Approve, Reject, Revoke) */}
      <ConfirmDialog
        isOpen={verifyModal.open}
        onClose={() => setVerifyModal({ open: false, status: 'APPROVED' })}
        title={
          verifyModal.status === 'APPROVED'
            ? `Approve Accreditation: ${user.name}`
            : verifyModal.status === 'REVOKED'
              ? `Revoke Accreditation: ${user.name}`
              : `Reject Accreditation: ${user.name}`
        }
        description={
          verifyModal.status === 'APPROVED'
            ? `Are you sure you want to approve alumni accreditation for ${user.name}? This will grant verified status across the campus directory.`
            : verifyModal.status === 'REVOKED'
              ? `Revoking accreditation will reset ${user.name}'s standing to PENDING and invalidate active sessions.`
              : `Rejecting accreditation will notify ${user.name} of the administrative decision and invalidate active sessions.`
        }
        confirmLabel={
          verifyModal.status === 'APPROVED'
            ? 'Approve Accreditation'
            : verifyModal.status === 'REVOKED'
              ? 'Revoke Accreditation'
              : 'Reject Accreditation'
        }
        variant={verifyModal.status === 'APPROVED' ? 'primary' : 'destructive'}
        isLoading={verifyMutation.isPending}
        onConfirm={() =>
          verifyMutation.mutate({
            status: verifyModal.status,
            reason: verifyReason.trim() || undefined,
          })
        }
      >
        {verifyModal.status !== 'APPROVED' ? (
          <div className="mt-3 text-left">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reason for {verifyModal.status === 'REVOKED' ? 'Revocation' : 'Rejection'} (Required, min 3 chars):
            </label>
            <textarea
              value={verifyReason}
              onChange={(e) => setVerifyReason(e.target.value)}
              placeholder="Explain the academic mismatch or accreditation reason..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:bg-white"
              rows={3}
              required
            />
          </div>
        ) : null}
      </ConfirmDialog>

      {/* Terminate Sessions Dialog */}
      <ConfirmDialog
        isOpen={terminateSessionsModalOpen}
        onClose={() => setTerminateSessionsModalOpen(false)}
        title={`Force Sign Out: ${user.name}`}
        description={`This will immediately revoke all ${user.refreshTokens?.length ?? 0} active session tokens for ${user.email}. The user will be required to sign in again.`}
        confirmLabel="Terminate Sessions"
        variant="destructive"
        isLoading={terminateSessionsMutation.isPending}
        onConfirm={() => terminateSessionsMutation.mutate()}
      />
    </div>
  );
}
