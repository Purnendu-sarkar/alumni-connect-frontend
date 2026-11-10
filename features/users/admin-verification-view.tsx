'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  GraduationCap,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  X,
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
import { getVerifications, reviewVerification } from '@/lib/api/admin.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole, VerificationItem, VerificationStatus } from '@/types/domain';

interface AdminVerificationViewProps {
  currentRole: UserRole;
  basePath: string;
  statusFilterPreset?: VerificationStatus;
}

export function AdminVerificationView({ currentRole, basePath, statusFilterPreset }: AdminVerificationViewProps) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [statusFilter, setStatusFilter] = useState<VerificationStatus>(statusFilterPreset || 'PENDING');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [rejectingUser, setRejectingUser] = useState<VerificationItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const verificationsQuery = useQuery({
    queryKey: ['admin-verifications', accessToken, statusFilter, roleFilter, search],
    queryFn: () =>
      getVerifications(accessToken, {
        status: statusFilter,
        role: roleFilter === 'ALL' ? undefined : roleFilter,
        search: search.trim() || undefined,
        limit: 50,
      }),
    enabled: Boolean(accessToken),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ userId, status, reason }: { userId: string; status: 'APPROVED' | 'REJECTED'; reason?: string }) =>
      reviewVerification(accessToken, userId, { status, reason }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setRejectingUser(null);
      setRejectionReason('');
      setActionNotice(
        vars.status === 'APPROVED'
          ? 'Member identity verified! Network and directory privileges unlocked.'
          : 'Verification returned to user with feedback.'
      );
      setTimeout(() => setActionNotice(null), 4000);
    },
    onError: (err: unknown) => {
      setActionNotice(err instanceof Error ? err.message : 'Failed to update verification status.');
    },
  });

  const records: VerificationItem[] = verificationsQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="ACADEMIC ACCREDITATION"
        title="Student & Alumni Verification Queue"
        description="Verify enrolled students, inspect graduation batch submissions, confirm institutional IDs, and accredit alumni."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => verificationsQuery.refetch()}
            disabled={verificationsQuery.isFetching}
          >
            <RefreshCw size={13} className={verificationsQuery.isFetching ? 'animate-spin' : ''} /> Refresh
          </Button>
        }
      />

      {actionNotice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      ) : null}

      {/* Filter Tabs & Search */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, email, student ID, or batch year…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
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
      </div>

      {/* Queue Items List */}
      {verificationsQuery.isLoading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : records.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title={`No ${statusFilter.toLowerCase()} verification records`}
          description="Your review queue is completely up to date."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {records.map((item) => (
            <div
              key={item.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Avatar name={item.name} src={item.avatarUrl} />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 m-0">{item.name}</h3>
                    <StatusBadge status={item.role.name} />
                    <StatusBadge status={item.verificationStatus} />
                  </div>

                  <p className="text-xs text-slate-500 m-0">
                    {item.email} · <strong className="text-slate-800">{item.department || 'No dept'}</strong> · Batch {item.batch || 'Class'}
                  </p>

                  <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-3 gap-y-0.5">
                    {item.studentId ? <span>Student ID: <strong className="text-slate-700 font-mono">{item.studentId}</strong></span> : null}
                    {item.academicId ? <span>Academic ID: <strong className="text-slate-700 font-mono">{item.academicId}</strong></span> : null}
                    {item.position || item.currentCompany ? (
                      <span>Work: {item.position} at {item.currentCompany}</span>
                    ) : null}
                    <span>Submitted: {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>

                  {item.rejectionReason ? (
                    <p className="text-xs text-rose-600 font-medium m-0 mt-1">
                      Return feedback: {item.rejectionReason}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {item.verificationStatus !== 'APPROVED' ? (
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={reviewMutation.isPending}
                    onClick={() =>
                      reviewMutation.mutate({
                        userId: item.id,
                        status: 'APPROVED',
                      })
                    }
                  >
                    <Check size={14} /> Approve Accreditation
                  </Button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={14} /> Accredited
                  </span>
                )}

                {item.verificationStatus !== 'REJECTED' ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={reviewMutation.isPending}
                    onClick={() => {
                      setRejectingUser(item);
                      setRejectionReason('Student ID or graduation batch record does not match institutional records.');
                    }}
                    className="text-rose-600 hover:bg-rose-50"
                  >
                    <X size={14} /> Reject
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingUser ? (
        <ConfirmDialog
          isOpen={Boolean(rejectingUser)}
          onClose={() => setRejectingUser(null)}
          onConfirm={() =>
            reviewMutation.mutate({
              userId: rejectingUser.id,
              status: 'REJECTED',
              reason: rejectionReason,
            })
          }
          title={`Reject Verification for ${rejectingUser.name}`}
          description={`Provide clear feedback to ${rejectingUser.name} explaining what academic information must be corrected.`}
          confirmLabel="Reject Submission"
          variant="destructive"
          isLoading={reviewMutation.isPending}
        >
          <div className="mt-3">
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Student ID does not match records for CSE batch 2020. Please update your official student registration number…"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </ConfirmDialog>
      ) : null}
    </div>
  );
}
