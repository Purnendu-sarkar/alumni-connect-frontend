'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  MailCheck,
  MailWarning,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog';
import { EmptyState } from '@/components/dashboard/empty-state';
import { TableSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { getVerifications, reviewVerification } from '@/lib/api/admin.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole, VerificationItem, VerificationStatus } from '@/types/domain';

interface AdminVerificationViewProps {
  currentRole: UserRole;
  basePath: string;
  statusFilterPreset?: VerificationStatus;
}

type EmailFilter = 'ALL' | 'VERIFIED' | 'UNVERIFIED';

export function AdminVerificationView({
  basePath,
  statusFilterPreset,
}: AdminVerificationViewProps) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [statusFilter, setStatusFilter] = useState<VerificationStatus>(
    statusFilterPreset || 'PENDING',
  );
  const [emailFilter, setEmailFilter] = useState<EmailFilter>('ALL');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ALUMNI' | 'STUDENT'>('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  const [rejectingUser, setRejectingUser] = useState<{
    user: VerificationItem;
    action: 'REJECTED' | 'REVOKED';
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

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

  const verificationsQuery = useQuery({
    queryKey: [
      'admin-verifications',
      accessToken,
      statusFilter,
      emailFilter,
      roleFilter,
      debouncedSearch,
      page,
    ],
    queryFn: () =>
      getVerifications(accessToken, {
        status: statusFilter,
        emailVerified: emailFilter,
        role: roleFilter === 'ALL' ? undefined : roleFilter,
        search: debouncedSearch || undefined,
        page,
        limit: 25,
      }),
    enabled: Boolean(accessToken),
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      userId,
      status,
      reason,
    }: {
      userId: string;
      status: 'APPROVED' | 'REJECTED' | 'REVOKED';
      reason?: string;
    }) => reviewVerification(accessToken, userId, { status, reason }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      setRejectingUser(null);
      setRejectionReason('');
      showFeedback(
        'success',
        vars.status === 'APPROVED'
          ? 'Member identity verified. Network and directory privileges are now active.'
          : vars.status === 'REVOKED'
            ? 'Accreditation revoked and active sessions terminated.'
            : 'Verification rejected and feedback sent to the applicant.',
      );
    },
    onError: (err: unknown) => {
      showFeedback(
        'error',
        err instanceof Error ? err.message : 'Failed to update verification status.',
      );
    },
  });

  const records: VerificationItem[] = verificationsQuery.data?.data ?? [];
  const meta = verificationsQuery.data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const totalCount = meta?.total ?? records.length;

  const isReasonValid = rejectionReason.trim().length >= 10;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="ACADEMIC ACCREDITATION"
        title="Student & Alumni Verification Queue"
        description="Inspect academic credentials, validate institutional email ownership, check duplicate ID signals, and accredit alumni."
        badge={
          <Badge variant={statusFilter === 'PENDING' && totalCount > 0 ? 'warning' : 'neutral'}>
            {totalCount} {statusFilter.toLowerCase()} record{totalCount === 1 ? '' : 's'}
          </Badge>
        }
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => verificationsQuery.refetch()}
            disabled={verificationsQuery.isFetching}
          >
            <RefreshCw size={13} className={verificationsQuery.isFetching ? 'animate-spin' : ''} />{' '}
            Refresh Queue
          </Button>
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
              placeholder="Search by name, email, student ID, academic ID, or batch…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === s
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s === 'PENDING' ? 'Pending Review' : s === 'APPROVED' ? 'Approved' : 'Rejected'}
              </button>
            ))}
          </div>
        </div>

        {/* Email Verification Filter Tabs & Role Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(
              [
                { id: 'ALL', label: 'All Submissions' },
                { id: 'VERIFIED', label: 'Ready to Verify (Email Confirmed)' },
                { id: 'UNVERIFIED', label: 'Awaiting Email Confirmation' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setEmailFilter(tab.id);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  emailFilter === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold">Role:</span>
            {(['ALL', 'ALUMNI', 'STUDENT'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRoleFilter(r);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  roleFilter === r
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r === 'ALL' ? 'All' : r === 'ALUMNI' ? 'Alumni' : 'Students'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error State with Retry */}
      {verificationsQuery.isError ? (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-rose-950 m-0">Unable to load verification queue</p>
              <p className="text-rose-700 m-0 mt-0.5">
                {verificationsQuery.error instanceof Error
                  ? verificationsQuery.error.message
                  : 'An unexpected error occurred while fetching pending verifications.'}
              </p>
            </div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => verificationsQuery.refetch()}>
            <RefreshCw size={13} /> Retry
          </Button>
        </div>
      ) : verificationsQuery.isLoading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : records.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title={`No ${statusFilter.toLowerCase()} verification records`}
          description={
            emailFilter === 'VERIFIED'
              ? 'No email-confirmed submissions are currently waiting. Switch to "All Submissions" to inspect applicants still awaiting email confirmation.'
              : 'Your verification queue is completely up to date.'
          }
          action={
            emailFilter !== 'ALL' ? (
              <Button size="sm" variant="secondary" onClick={() => setEmailFilter('ALL')}>
                Show All Submissions
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {records.map((item) => {
              const duplicateCount = item.signals?.duplicateIdCount ?? 0;
              const emailDomainValid = item.signals?.emailDomainValid ?? false;
              const canApprove = item.verified && item.verificationStatus !== 'APPROVED';

              return (
                <div
                  key={item.id}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <Avatar name={item.name} src={item.avatarUrl} />
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`${basePath}/verification/${item.id}`}
                          className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <StatusBadge status={item.role.name} />
                        <StatusBadge status={item.verificationStatus} />
                      </div>

                      <p className="text-xs text-slate-500 m-0">
                        {item.email} ·{' '}
                        <strong className="text-slate-800">
                          {item.departmentRef?.name || item.department || 'No department'}
                        </strong>{' '}
                        · Batch {item.batch || 'N/A'}
                        {item.graduationYear ? ` · Class of ${item.graduationYear}` : ''}
                      </p>

                      {/* Verification Signal Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {item.verified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <MailCheck size={11} /> Email Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <MailWarning size={11} /> Awaiting Email Confirmation
                          </span>
                        )}

                        {emailDomainValid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <ShieldCheck size={11} /> Campus Domain
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            External Email
                          </span>
                        )}

                        {duplicateCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle size={11} /> Duplicate ID Signal ({duplicateCount + 1}{' '}
                            matches)
                          </span>
                        ) : null}
                      </div>

                      <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-3 gap-y-0.5">
                        {item.studentId ? (
                          <span>
                            Student ID:{' '}
                            <strong className="text-slate-700 font-mono">{item.studentId}</strong>
                          </span>
                        ) : null}
                        {item.academicId ? (
                          <span>
                            Academic ID:{' '}
                            <strong className="text-slate-700 font-mono">{item.academicId}</strong>
                          </span>
                        ) : null}
                        {item.position || item.currentCompany ? (
                          <span>
                            Career: {item.position || 'Member'}
                            {item.currentCompany ? ` at ${item.currentCompany}` : ''}
                          </span>
                        ) : null}
                        <span>Submitted: {new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>

                      {!item.verified && item.verificationStatus === 'PENDING' ? (
                        <p className="text-[11px] text-amber-700 font-medium m-0">
                          <Clock size={11} className="inline mr-1" />
                          Approval is gated until this applicant confirms their email address.
                        </p>
                      ) : null}

                      {item.rejectionReason ? (
                        <p className="text-xs text-rose-600 font-medium m-0 mt-1">
                          Recorded decision note: {item.rejectionReason}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap self-end lg:self-center">
                    <Button size="sm" variant="secondary" asChild>
                      <Link href={`${basePath}/verification/${item.id}`}>
                        <Eye size={13} /> Inspect Profile
                      </Link>
                    </Button>

                    {item.verificationStatus !== 'APPROVED' ? (
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={reviewMutation.isPending || !canApprove}
                        title={
                          !item.verified
                            ? 'Applicant must verify their email address before accreditation approval.'
                            : 'Approve accreditation'
                        }
                        onClick={() =>
                          reviewMutation.mutate({
                            userId: item.id,
                            status: 'APPROVED',
                          })
                        }
                      >
                        <Check size={14} /> Approve
                      </Button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 px-2">
                        <CheckCircle2 size={14} /> Accredited
                      </span>
                    )}

                    {item.verificationStatus === 'APPROVED' ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={reviewMutation.isPending}
                        onClick={() => {
                          setRejectingUser({ user: item, action: 'REVOKED' });
                          setRejectionReason('');
                        }}
                        className="text-amber-700 hover:bg-amber-50"
                      >
                        Revoke
                      </Button>
                    ) : item.verificationStatus !== 'REJECTED' ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={reviewMutation.isPending}
                        onClick={() => {
                          setRejectingUser({ user: item, action: 'REJECTED' });
                          setRejectionReason('');
                        }}
                        className="text-rose-600 hover:bg-rose-50"
                      >
                        <X size={14} /> Reject
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })}
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
                  disabled={page <= 1 || verificationsQuery.isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page >= totalPages || verificationsQuery.isFetching}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Reject / Revoke Modal */}
      {rejectingUser ? (
        <ConfirmDialog
          isOpen={Boolean(rejectingUser)}
          onClose={() => {
            setRejectingUser(null);
            setRejectionReason('');
          }}
          onConfirm={() => {
            if (!isReasonValid) return;
            reviewMutation.mutate({
              userId: rejectingUser.user.id,
              status: rejectingUser.action,
              reason: rejectionReason.trim(),
            });
          }}
          title={
            rejectingUser.action === 'REVOKED'
              ? `Revoke Accreditation: ${rejectingUser.user.name}`
              : `Reject Verification: ${rejectingUser.user.name}`
          }
          description={
            rejectingUser.action === 'REVOKED'
              ? `Revoking accreditation resets ${rejectingUser.user.name} to pending review and terminates their active sessions. Provide an audit reason.`
              : `Provide clear feedback to ${rejectingUser.user.name} explaining what academic record or ID detail must be corrected.`
          }
          confirmLabel={
            rejectingUser.action === 'REVOKED' ? 'Revoke Accreditation' : 'Reject Submission'
          }
          variant="destructive"
          isLoading={reviewMutation.isPending}
          confirmDisabled={!isReasonValid}
        >
          <div className="mt-3 space-y-1.5 text-left">
            <label
              htmlFor="verification-decision-reason"
              className="block text-xs font-bold text-slate-700"
            >
              Mandatory Reason (minimum 10 characters) *
            </label>
            <textarea
              id="verification-decision-reason"
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Student ID does not match registrar records for CSE batch 2020. Please update your official registration ID."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:bg-white"
            />
            <p
              className={`text-[11px] m-0 ${
                isReasonValid ? 'text-emerald-600' : 'text-slate-500'
              }`}
            >
              {rejectionReason.trim().length}/10 minimum characters
            </p>
          </div>
        </ConfirmDialog>
      ) : null}
    </div>
  );
}
