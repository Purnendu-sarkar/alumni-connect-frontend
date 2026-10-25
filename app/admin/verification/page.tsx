'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Filter,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getVerifications, reviewVerification } from '@/lib/api/admin.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole, VerificationItem, VerificationStatus } from '@/types/domain';

export default function AdminVerificationPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const [statusFilter, setStatusFilter] = useState<VerificationStatus>('PENDING');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const [rejectingUser, setRejectingUser] = useState<VerificationItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const isStaff = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'MODERATOR';

  const query = useQuery({
    queryKey: ['admin-verifications', accessToken, statusFilter, roleFilter, search],
    queryFn: () =>
      getVerifications(accessToken, {
        status: statusFilter,
        role: roleFilter === 'ALL' ? undefined : roleFilter,
        search: search.trim() || undefined,
        limit: 50,
      }),
    enabled: Boolean(accessToken && isStaff),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ userId, status, reason }: { userId: string; status: 'APPROVED' | 'REJECTED'; reason?: string }) =>
      reviewVerification(accessToken, userId, { status, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      setRejectingUser(null);
      setRejectionReason('');
      setActionError(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to review verification.';
      setActionError(msg);
    },
  });

  if (!user || !isStaff) {
    return (
      <main className="page-shell">
        <div className="dashboard-note" style={{ borderLeft: '4px solid #ef4444', maxWidth: '600px', margin: '4rem auto' }}>
          <h2>Access Restricted</h2>
          <p>You must be an institutional Administrator or Moderator to view the Verification Queue.</p>
          <Button asChild style={{ marginTop: '1rem' }}>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </main>
    );
  }

  const verifications = query.data?.data ?? [];

  return (
    <main className="page-shell">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link href="/dashboard" className="back-link">
            <ArrowLeft size={16} /> Back to dashboard
          </Link>
          <p className="eyebrow">INSTITUTIONAL ADMINISTRATION</p>
          <h1>Alumni & Student Verification Queue</h1>
          <p className="lede">
            Review academic identity, verify official institutional enrollment, or reject unconfirmed submissions.
          </p>
        </div>

        <Button variant="secondary" onClick={() => query.refetch()} disabled={query.isFetching}>
          <RefreshCw size={16} className={query.isFetching ? 'animate-spin' : ''} /> Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', margin: '2rem 0 1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={statusFilter === status ? 'filter-chip filter-chip--selected' : 'filter-chip'}
              style={{ fontWeight: 600 }}
            >
              {status === 'PENDING' ? 'Pending Review' : status === 'APPROVED' ? 'Approved' : 'Rejected'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={16} style={{ color: 'var(--muted, #666)' }} />
          {(['ALL', 'STUDENT', 'ALUMNI'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={roleFilter === r ? 'filter-chip filter-chip--selected' : 'filter-chip'}
            >
              {r === 'ALL' ? 'All Roles' : r === 'STUDENT' ? 'Students' : 'Alumni'}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: '1.5rem', maxWidth: '480px' }}>
        <Input
          placeholder="Search name, email, department, or student ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {actionError ? (
        <div className="dashboard-note" style={{ borderLeft: '4px solid #ef4444', marginBottom: '1rem' }}>
          <p style={{ color: '#b91c1c', margin: 0 }}>{actionError}</p>
        </div>
      ) : null}

      {/* Rejection Modal / Inline Dialog */}
      {rejectingUser ? (
        <div
          className="dashboard-note"
          style={{
            border: '2px solid #ef4444',
            background: '#fff5f5',
            margin: '1.5rem 0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={20} /> Reject verification for {rejectingUser.name}
            </h3>
            <button
              type="button"
              onClick={() => setRejectingUser(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#7f1d1d', margin: '0.5rem 0' }}>
            Provide clear feedback explaining why this submission could not be verified (e.g. Student ID
            mismatch, batch year incorrect). The user will see this feedback and can update their profile.
          </p>

          <textarea
            className="field__input"
            rows={3}
            placeholder="e.g. Student ID does not match records for CSE batch 2020. Please re-enter your official university ID number."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            style={{ width: '100%', marginTop: '0.5rem' }}
          />

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <Button
              onClick={() =>
                reviewMutation.mutate({
                  userId: rejectingUser.id,
                  status: 'REJECTED',
                  reason: rejectionReason,
                })
              }
              disabled={reviewMutation.isPending || rejectionReason.trim().length < 3}
              style={{ background: '#dc2626', color: '#fff' }}
            >
              {reviewMutation.isPending ? 'Rejecting…' : 'Confirm Rejection'}
            </Button>
            <Button variant="ghost" onClick={() => setRejectingUser(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {/* Verification Items List */}
      {query.isLoading ? (
        <p className="empty-state">Loading verification records…</p>
      ) : verifications.length === 0 ? (
        <p className="empty-state">
          <ShieldCheck size={28} />
          No {statusFilter.toLowerCase()} verification records found.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {verifications.map((item) => (
            <article
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                padding: '1.25rem',
                background: 'var(--surface-muted, #f8f8f8)',
                borderRadius: 'var(--radius, 8px)',
                border: item.verificationStatus === 'REJECTED' ? '1px solid #fecaca' : '1px solid var(--border, #e5e5e5)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Avatar name={item.name} src={item.avatarUrl} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '1.05rem' }}>{item.name}</strong>
                    <Badge variant={item.role.name === 'ALUMNI' ? 'success' : 'neutral'}>
                      {item.role.name}
                    </Badge>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted, #666)' }}>
                    {item.email} · {item.department || 'No dept'} · Batch {item.batch || 'N/A'}
                  </span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted, #888)', marginTop: '0.25rem' }}>
                    {item.studentId ? <span>Student ID: <strong>{item.studentId}</strong> · </span> : null}
                    {item.academicId ? <span>Academic ID: <strong>{item.academicId}</strong> · </span> : null}
                    {item.position || item.currentCompany ? (
                      <span>Work: {item.position} @ {item.currentCompany} · </span>
                    ) : null}
                    <span>Submitted: {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>

                  {item.rejectionReason ? (
                    <div style={{ marginTop: '0.5rem', color: '#dc2626', fontSize: '0.85rem' }}>
                      <strong>Rejection reason:</strong> {item.rejectionReason}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Review Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {item.verificationStatus !== 'APPROVED' ? (
                  <Button
                    onClick={() =>
                      reviewMutation.mutate({
                        userId: item.id,
                        status: 'APPROVED',
                      })
                    }
                    disabled={reviewMutation.isPending}
                    style={{ background: '#16a34a', color: '#fff' }}
                  >
                    <Check size={16} /> Approve
                  </Button>
                ) : (
                  <Badge variant="success">
                    <CheckCircle2 size={14} style={{ marginRight: '4px' }} /> Verified
                  </Badge>
                )}

                {item.verificationStatus !== 'REJECTED' ? (
                  <Button
                    variant="ghost"
                    onClick={() => setRejectingUser(item)}
                    style={{ color: '#dc2626' }}
                  >
                    <X size={16} /> Reject
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
