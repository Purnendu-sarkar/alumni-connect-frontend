'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { getVerifications, reviewVerification } from '@/lib/api/admin.api';
import { useAuth } from '@/lib/hooks/use-auth';
import type { UserRole, VerificationItem, VerificationStatus } from '@/types/domain';
import { TableSkeleton } from '@/components/shared/skeletons';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { ReauthModal } from '@/components/shared/reauth-modal';

export default function AdminVerificationPage() {
  const queryClient = useQueryClient();
  const { user, role, isLoading: authLoading } = useAuth();

  const [statusFilter, setStatusFilter] = useState<VerificationStatus>('PENDING');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const [selectedUser, setSelectedUser] = useState<VerificationItem | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [showReauthModal, setShowReauthModal] = useState(false);

  const query = useQuery({
    queryKey: ['admin-verifications', statusFilter, roleFilter, search],
    queryFn: () =>
      getVerifications({
        status: statusFilter,
        role: roleFilter === 'ALL' ? undefined : (roleFilter as UserRole),
        search: search.trim() || undefined,
        limit: 50,
      }),
    enabled: Boolean(user && role === 'SUPER_ADMIN'),
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      userId,
      status,
      reason,
    }: {
      userId: string;
      status: 'APPROVED' | 'REJECTED';
      reason?: string;
    }) => reviewVerification(userId, { status, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      setSelectedUser(null);
      setActionType(null);
      setRejectionReason('');
      setActionError(null);
    },
    onError: (err: any) => {
      if (err.code === 'REAUTH_REQUIRED' || err.status === 401) {
        setShowReauthModal(true);
      } else {
        setActionError(err.message || 'Failed to review verification.');
      }
    },
  });

  const handleConfirmAction = () => {
    if (!selectedUser || !actionType) return;
    reviewMutation.mutate({
      userId: selectedUser.id,
      status: actionType === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      reason: actionType === 'REJECT' ? rejectionReason : undefined,
    });
  };

  if (authLoading) {
    return <TableSkeleton rows={8} columns={5} />;
  }

  const verifications = query.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Institutional Verification Queue
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review academic enrollment records and manage verification approvals.
          </p>
        </div>

        <button
          onClick={() => query.refetch()}
          disabled={query.isFetching}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${query.isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, student ID, email..."
            className="w-full rounded-lg border border-slate-200 py-1.5 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Status:</span>
          {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                statusFilter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Role:</span>
          {(['ALL', 'STUDENT', 'ALUMNI'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                roleFilter === r
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Table */}
      {query.isLoading ? (
        <TableSkeleton rows={6} columns={5} />
      ) : query.isError ? (
        <ErrorState
          title="Failed to load verifications"
          message="Could not load the queue from the institutional admin service."
          onRetry={() => query.refetch()}
        />
      ) : verifications.length === 0 ? (
        <EmptyState
          title="Queue is empty"
          description={`No ${statusFilter.toLowerCase()} verification records found matching your filters.`}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Academic Credentials</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {verifications.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-slate-400">{item.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                        {item.role?.name ?? 'USER'}
                      </span>
                    </td>
                    <td className="py-3 px-4 space-y-0.5">
                      <div>Dept: <span className="font-medium text-slate-900">{item.department || 'N/A'}</span></div>
                      <div>ID: <span className="font-mono text-slate-900">{item.studentId || item.academicId || 'N/A'}</span></div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold text-[11px] ${
                          item.verificationStatus === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.verificationStatus === 'REJECTED'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {item.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {item.verificationStatus === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(item);
                              setActionType('APPROVE');
                            }}
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 font-semibold text-white hover:bg-emerald-700 shadow-xs"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(item);
                              setActionType('REJECT');
                            }}
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1 font-semibold text-red-600 hover:bg-red-50 shadow-xs"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedUser && actionType && (
        <ConfirmModal
          isOpen={true}
          title={actionType === 'APPROVE' ? 'Approve Verification' : 'Reject Verification'}
          message={
            actionType === 'APPROVE'
              ? `Are you sure you want to verify ${selectedUser.name}? This grants full access to the institutional directory and network features.`
              : `Are you sure you want to reject ${selectedUser.name}'s verification submission?`
          }
          confirmLabel={actionType === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
          variant={actionType === 'APPROVE' ? 'default' : 'danger'}
          isLoading={reviewMutation.isPending}
          onConfirm={handleConfirmAction}
          onCancel={() => {
            setSelectedUser(null);
            setActionType(null);
          }}
        >
          {actionType === 'REJECT' && (
            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Rejection (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Student ID does not match registrar database."
                rows={2}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-red-500 focus:outline-none"
              />
            </div>
          )}
        </ConfirmModal>
      )}

      {/* Reauth Modal Checkpoint (15-minute Super Admin security window) */}
      <ReauthModal
        isOpen={showReauthModal}
        onSuccess={() => {
          setShowReauthModal(false);
          handleConfirmAction();
        }}
        onCancel={() => setShowReauthModal(false)}
      />
    </div>
  );
}
