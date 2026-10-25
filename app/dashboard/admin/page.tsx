'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  FileCheck2,
  RefreshCw,
  UserCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { getAdminStats, getVerifications, reviewVerification } from '@/lib/api/admin.api';
import { useAuthStore } from '@/store/auth-store';

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const firstName = user?.name ? user.name.split(' ')[0] : 'Administrator';

  const [actionError, setActionError] = useState<string | null>(null);

  const statsQuery = useQuery({
    queryKey: ['admin-stats', accessToken],
    queryFn: () => getAdminStats(accessToken),
    enabled: Boolean(accessToken),
  });

  const recentVerificationsQuery = useQuery({
    queryKey: ['admin-recent-verifications', accessToken],
    queryFn: () => getVerifications(accessToken, { status: 'PENDING', limit: 5 }),
    enabled: Boolean(accessToken),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'APPROVED' | 'REJECTED' }) =>
      reviewVerification(accessToken, userId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-recent-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      setActionError(null);
    },
    onError: (err: unknown) => {
      setActionError(err instanceof Error ? err.message : 'Failed to update verification status.');
    },
  });

  const stats = statsQuery.data?.data;
  const pendingList = recentVerificationsQuery.data?.data ?? [];

  return (
    <section className="dashboard-page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <p className="eyebrow">{user?.university?.name ? user.university.name.toUpperCase() : 'CAMPUS ADMINISTRATION'}</p>
          <h1>University Admin Desk — {firstName}.</h1>
          <p className="lede">
            Institutional Tenant Control · Oversee academic verification queues, member records, and campus activity.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Badge variant="neutral" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
            <Building2 size={14} style={{ marginRight: '4px' }} /> University Admin
          </Badge>
          <Button
            variant="secondary"
            onClick={() => {
              statsQuery.refetch();
              recentVerificationsQuery.refetch();
            }}
            disabled={statsQuery.isFetching}
          >
            <RefreshCw size={14} className={statsQuery.isFetching ? 'animate-spin' : ''} /> Refresh Desk
          </Button>
        </div>
      </div>

      {actionError ? (
        <div style={{ marginTop: '1.25rem' }}>
          <FormAlert>{actionError}</FormAlert>
        </div>
      ) : null}

      {/* Campus Key Metrics */}
      <div className="dashboard-stats" style={{ marginTop: '1.5rem' }}>
        <article>
          <Users size={24} style={{ color: '#2563eb' }} />
          <strong>{stats?.totalUsers ?? '…'}</strong>
          <span>TOTAL CAMPUS USERS</span>
        </article>
        <article>
          <Clock size={24} style={{ color: '#d97706' }} />
          <strong>{stats?.pendingVerifications ?? '…'}</strong>
          <span>PENDING VERIFICATIONS</span>
        </article>
        <article>
          <UserCheck size={24} style={{ color: '#16a34a' }} />
          <strong>{stats?.approvedUsers ?? '…'}</strong>
          <span>VERIFIED MEMBERS</span>
        </article>
        <article>
          <BriefcaseBusiness size={24} style={{ color: '#7c3aed' }} />
          <strong>{stats?.pendingJobs ?? '…'}</strong>
          <span>PENDING JOBS</span>
        </article>
      </div>

      {/* Quick Action Navigation */}
      <div className="dashboard-split" style={{ marginTop: '2rem' }}>
        <section>
          <div className="section-heading">
            <div>
              <p className="eyebrow">WORKFLOW CONTROLS</p>
              <h2>Institutional Operations</h2>
            </div>
          </div>
          <p style={{ color: 'var(--muted, #666)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Execute administrative duties within your university tenant. All operations are isolated to{' '}
            <strong>{user?.university?.name || user?.university?.slug}</strong>.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <Button asChild>
              <Link href="/admin/verification">Open Verification Desk <ArrowUpRight size={14} /></Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/dashboard/moderator">Job Moderation Queue <FileCheck2 size={14} /></Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/alumni">View Campus Directory</Link>
            </Button>
          </div>
        </section>

        <aside className="dashboard-note">
          <p className="eyebrow">INSTITUTION PROFILE</p>
          <h2>{user?.university?.name || 'Assigned University'}</h2>
          <p style={{ margin: '0.25rem 0 0.5rem', fontSize: '0.875rem' }}>
            Slug: <code>{user?.university?.slug}</code> · Domain: <code>{user?.university?.domain}</code>
          </p>
          <p style={{ fontSize: '0.825rem', color: 'var(--muted, #666)' }}>
            Institutional administrators have strict role boundaries: you cannot alter external tenants or platform owner configurations.
          </p>
        </aside>
      </div>

      {/* Pending Verifications Preview */}
      <div style={{ marginTop: '2.5rem' }}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">URGENT ACTION</p>
            <h2>Pending Student & Alumni Verifications</h2>
          </div>
          <Button asChild variant="secondary">
            <Link href="/admin/verification">View All in Queue <ArrowUpRight size={14} /></Link>
          </Button>
        </div>

        {recentVerificationsQuery.isLoading ? (
          <p className="empty-state">Loading verification submissions…</p>
        ) : pendingList.length === 0 ? (
          <div
            style={{
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              border: '1px dashed var(--border, #d1d5db)',
              borderRadius: '8px',
              marginTop: '1rem',
            }}
          >
            <CheckCircle2 size={32} style={{ margin: '0 auto 0.75rem', color: '#16a34a' }} />
            <p style={{ fontWeight: 600, margin: '0 0 0.25rem' }}>No pending verification requests</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted, #666)', margin: 0 }}>
              All new student and alumni registrants have been processed for your university.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
            {pendingList.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  borderRadius: '8px',
                  background: 'var(--surface-muted, #f8f8f8)',
                  border: '1px solid var(--border, #e5e5e5)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '1rem' }}>{item.name}</strong>
                    <Badge variant={item.role.name === 'ALUMNI' ? 'success' : 'neutral'}>
                      {item.role.name}
                    </Badge>
                  </div>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--muted, #666)' }}>
                    {item.email} · {item.department || 'No dept'} · Batch {item.batch || '—'}
                    {item.studentId ? ` · ID: ${item.studentId}` : ''}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button
                    onClick={() => reviewMutation.mutate({ userId: item.id, status: 'APPROVED' })}
                    disabled={reviewMutation.isPending}
                    style={{ background: '#16a34a', color: '#fff', fontSize: '0.85rem' }}
                  >
                    <Check size={14} /> Quick Approve
                  </Button>
                  <Button asChild variant="ghost" style={{ fontSize: '0.85rem' }}>
                    <Link href="/admin/verification">Review Details</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
